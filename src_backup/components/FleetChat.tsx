import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, MessageCircle, AlertTriangle, Check, X, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  FleetChatMessage, 
  FleetHelpRequest, 
  CautooFleet,
  isFleetAdmin,
  getActiveAssistance,
  hasAssistanceAvailableCalls,
} from "@/lib/fleetTypes";

interface FleetChatProps {
  fleet: CautooFleet;
  currentUserId: string;
  currentUserName: string;
  onSendMessage: (text: string) => void;
  onApproveHelp: (requestId: string) => void;
  onRejectHelp: (requestId: string) => void;
}

export function FleetChat({ 
  fleet, 
  currentUserId, 
  currentUserName,
  onSendMessage,
  onApproveHelp,
  onRejectHelp,
}: FleetChatProps) {
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isAdmin = isFleetAdmin(fleet, currentUserId);
  const activeAssistance = getActiveAssistance(fleet);
  const canApprove = activeAssistance && hasAssistanceAvailableCalls(activeAssistance);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [fleet.chatMessages]);

  const handleSend = () => {
    if (!message.trim()) return;
    onSendMessage(message.trim());
    setMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getPendingRequest = (messageId: string): FleetHelpRequest | undefined => {
    const msg = fleet.chatMessages.find(m => m.id === messageId);
    if (!msg?.helpRequestId) return undefined;
    return fleet.helpRequests.find(hr => hr.id === msg.helpRequestId && hr.status === 'pending_approval');
  };

  const getRequestStatus = (helpRequestId?: string): FleetHelpRequest | undefined => {
    if (!helpRequestId) return undefined;
    return fleet.helpRequests.find(hr => hr.id === helpRequestId);
  };

  const formatMessageTime = (dateString: string) => {
    return format(new Date(dateString), "HH:mm", { locale: ptBR });
  };

  const formatMessageDate = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR });
  };

  // Group messages by date
  const groupedMessages = fleet.chatMessages.reduce((groups, msg) => {
    const date = formatMessageDate(msg.createdAt);
    if (!groups[date]) groups[date] = [];
    groups[date].push(msg);
    return groups;
  }, {} as Record<string, FleetChatMessage[]>);

  return (
    <div className="flex flex-col h-full bg-background rounded-xl border border-border overflow-hidden">
      {/* Chat Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-card">
        <MessageCircle className="w-5 h-5 text-primary" />
        <span className="font-medium text-foreground">Chat da Frota</span>
        <Badge variant="secondary" className="ml-auto text-xs">
          {fleet.members.length} membros
        </Badge>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px] max-h-[400px]">
        {fleet.chatMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <MessageCircle className="w-12 h-12 text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">Nenhuma mensagem ainda</p>
            <p className="text-xs text-muted-foreground mt-1">
              Seja o primeiro a enviar uma mensagem!
            </p>
          </div>
        ) : (
          Object.entries(groupedMessages).map(([date, messages]) => (
            <div key={date}>
              {/* Date Separator */}
              <div className="flex items-center justify-center mb-4">
                <div className="bg-muted px-3 py-1 rounded-full">
                  <span className="text-xs text-muted-foreground">{date}</span>
                </div>
              </div>

              {/* Messages */}
              <div className="space-y-3">
                <AnimatePresence>
                  {messages.map((msg) => {
                    const isOwnMessage = msg.senderId === currentUserId;
                    const isSystem = msg.type === 'system';
                    const isHelpRequest = msg.type === 'help_request';
                    const pendingRequest = isHelpRequest ? getPendingRequest(msg.id) : undefined;
                    const requestStatus = getRequestStatus(msg.helpRequestId);

                    // System message
                    if (isSystem) {
                      return (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex justify-center"
                        >
                          <div className="bg-muted/50 px-3 py-1.5 rounded-full">
                            <span className="text-xs text-muted-foreground">{msg.text}</span>
                          </div>
                        </motion.div>
                      );
                    }

                    // Help request message
                    if (isHelpRequest) {
                      return (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-red-500/10 border border-red-500/30 rounded-xl p-3"
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                              <AlertTriangle className="w-4 h-4 text-red-500" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-red-500">{msg.text}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {formatMessageTime(msg.createdAt)}
                              </p>

                              {/* Show status or approval buttons */}
                              {requestStatus?.status === 'approved' && (
                                <div className="flex items-center gap-1 mt-2 text-green-500">
                                  <Check className="w-3 h-3" />
                                  <span className="text-xs">Socorro aprovado</span>
                                </div>
                              )}
                              {requestStatus?.status === 'used' && (
                                <div className="flex items-center gap-1 mt-2 text-blue-500">
                                  <Check className="w-3 h-3" />
                                  <span className="text-xs">Chamado utilizado</span>
                                </div>
                              )}
                              {requestStatus?.status === 'rejected' && (
                                <div className="flex items-center gap-1 mt-2 text-muted-foreground">
                                  <X className="w-3 h-3" />
                                  <span className="text-xs">Solicitação recusada</span>
                                </div>
                              )}

                              {/* Admin approval buttons */}
                              {isAdmin && pendingRequest && (
                                <div className="flex gap-2 mt-3">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => onRejectHelp(pendingRequest.id)}
                                    className="text-xs"
                                  >
                                    <X className="w-3 h-3 mr-1" />
                                    Recusar
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() => onApproveHelp(pendingRequest.id)}
                                    disabled={!canApprove}
                                    className="text-xs bg-green-500 hover:bg-green-600"
                                  >
                                    <Check className="w-3 h-3 mr-1" />
                                    Aprovar
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    }

                    // Regular message
                    return (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-xl px-4 py-2 ${
                            isOwnMessage
                              ? 'bg-primary text-primary-foreground rounded-br-sm'
                              : 'bg-card border border-border rounded-bl-sm'
                          }`}
                        >
                          {!isOwnMessage && (
                            <div className="flex items-center gap-1 mb-1">
                              <span className="text-xs font-medium text-primary">
                                {msg.senderName}
                              </span>
                              {isFleetAdmin(fleet, msg.senderId) && (
                                <Crown className="w-3 h-3 text-yellow-500" />
                              )}
                            </div>
                          )}
                          <p className={`text-sm ${isOwnMessage ? 'text-primary-foreground' : 'text-foreground'}`}>
                            {msg.text}
                          </p>
                          <p className={`text-xs mt-1 ${
                            isOwnMessage ? 'text-primary-foreground/70' : 'text-muted-foreground'
                          }`}>
                            {formatMessageTime(msg.createdAt)}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-border p-3 bg-card">
        <div className="flex items-center gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Digite sua mensagem..."
            className="flex-1"
          />
          <Button 
            onClick={handleSend} 
            disabled={!message.trim()}
            size="icon"
            className="shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default FleetChat;
