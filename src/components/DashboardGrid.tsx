import React, { useState, useEffect, useCallback } from "react";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
    DragStartEvent,
    DragOverlay,
    TouchSensor,
    MouseSensor,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    rectSortingStrategy,
    useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Gift, LucideIcon, GripVertical, Settings2, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";

interface MenuItem {
    icon: LucideIcon;
    label: string;
    path: string;
    badge?: number;
    color: string;
    bg: string;
    requiresVerified?: boolean;
}

interface ReferralItem {
    icon: LucideIcon;
    label: string;
    path: string;
    color: string;
    bg: string;
    isHighlighted: boolean;
}

interface Props {
    menuItems: MenuItem[];
    referralItem: ReferralItem;
    isVerified: boolean;
}

const STORAGE_KEY = "cautoo_dashboard_order_v2";

const SortableItem = ({
    item,
    isReordering,
    isVerified,
    onClick
}: {
    item: MenuItem;
    isReordering: boolean;
    isVerified: boolean;
    onClick: () => void;
}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: item.path, disabled: !isReordering });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 1,
    };

    const IconComponent = item.icon;
    const isLocked = item.requiresVerified && !isVerified;

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`relative h-full ${isDragging ? "opacity-30" : "opacity-100"}`}
        >
            <motion.div
                className={`h-full w-full relative bg-card rounded-xl p-4 text-left transition-all ${isLocked ? "opacity-60" : "hover:bg-secondary/50"
                    } ${isReordering ? "ring-1 ring-primary/20 shadow-inner cursor-grab active:cursor-grabbing select-none" : ""}`}
                layoutId={item.path}
            >
                {isReordering && (
                    <div
                        className="absolute top-0 right-0 p-4 z-20 touch-none active:scale-110 transition-transform"
                        {...attributes}
                        {...listeners}
                    >
                        <div className="bg-primary/10 p-1 rounded-md">
                            <GripVertical className="w-5 h-5 text-primary" />
                        </div>
                    </div>
                )}

                <div
                    className={`h-full w-full ${isReordering ? "select-none" : ""}`}
                    onClick={(e) => {
                        if (isReordering) {
                            e.preventDefault();
                            e.stopPropagation();
                            return;
                        }
                        onClick();
                    }}
                >
                    <div className={`w-10 h-10 rounded-lg ${item.bg} flex items-center justify-center mb-3`}>
                        <IconComponent className={`w-5 h-5 ${item.color}`} />
                    </div>
                    <span className="text-sm font-medium text-foreground block pr-8 select-none">{item.label}</span>
                    {item.badge && item.badge > 0 && !isReordering && (
                        <motion.span
                            className="absolute top-3 right-3 w-5 h-5 bg-destructive text-destructive-foreground text-xs font-bold rounded-full flex items-center justify-center"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                        >
                            {item.badge}
                        </motion.span>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export const DashboardGrid = ({ menuItems, referralItem, isVerified }: Props) => {
    const navigate = useNavigate();
    const [items, setItems] = useState<MenuItem[]>([]);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [isReordering, setIsReordering] = useState(false);

    // Load order
    useEffect(() => {
        const savedOrder = localStorage.getItem(STORAGE_KEY);
        if (savedOrder) {
            try {
                const order = JSON.parse(savedOrder) as string[];
                const orderedItems = order
                    .map((path) => menuItems.find((i) => i.path === path))
                    .filter((i): i is MenuItem => !!i);

                // Add any new items that weren't in the saved order
                const newItems = menuItems.filter((i) => !order.some(p => p === i.path));
                setItems([...orderedItems, ...newItems]);
            } catch (e) {
                setItems(menuItems);
            }
        } else {
            setItems(menuItems);
        }
    }, [menuItems]);

    // Save order function
    const saveOrder = useCallback((newItems: MenuItem[]) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newItems.map((i) => i.path)));
    }, []);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // Minimum movement before drag starts
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setItems((prevItems) => {
                const oldIndex = prevItems.findIndex((i) => i.path === active.id);
                const newIndex = prevItems.findIndex((i) => i.path === over.id);
                const updatedItems = arrayMove(prevItems, oldIndex, newIndex);
                saveOrder(updatedItems);
                return updatedItems;
            });
        }

        setActiveId(null);
    };

    const activeItem = activeId ? items.find((i) => i.path === activeId) : null;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
                <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Funcionalidades</h2>
                <Button
                    variant={isReordering ? "default" : "outline"}
                    size="sm"
                    onClick={() => setIsReordering(!isReordering)}
                    className={`h-8 gap-2 rounded-full transition-all ${isReordering ? 'bg-primary animate-pulse' : ''}`}
                >
                    {isReordering ? (
                        <><Check className="w-3.5 h-3.5" /> Concluir</>
                    ) : (
                        <><Settings2 className="w-3.5 h-3.5" /> Organizar</>
                    )}
                </Button>
            </div>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <SortableContext items={items.map((i) => i.path)} strategy={rectSortingStrategy}>
                    <div className="grid grid-cols-2 gap-3">
                        {items.map((item) => (
                            <SortableItem
                                key={item.path}
                                item={item}
                                isReordering={isReordering}
                                isVerified={isVerified}
                                onClick={() => navigate(item.path)}
                            />
                        ))}
                    </div>
                </SortableContext>

                <DragOverlay adjustScale={true} dropAnimation={{
                    duration: 250,
                    easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
                }}>
                    {activeItem ? (
                        <div className="w-full h-full scale-105 opacity-90 cursor-grabbing">
                            <div className="h-full bg-card rounded-xl p-4 shadow-2xl ring-2 ring-primary/30">
                                <div className={`w-10 h-10 rounded-lg ${activeItem.bg} flex items-center justify-center mb-3`}>
                                    <activeItem.icon className={`w-5 h-5 ${activeItem.color}`} />
                                </div>
                                <span className="text-sm font-medium text-foreground">{activeItem.label}</span>
                            </div>
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>

            {/* Referral item is fixed at the bottom */}
            <motion.button
                onClick={() => navigate(referralItem.path)}
                className="relative w-full rounded-2xl p-5 text-left transition-all shadow-md hover:shadow-lg bg-gradient-to-r from-emerald-500 to-teal-500 border-0 mt-2"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
            >
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                        <Gift className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                        <span className="text-base font-semibold text-white block">
                            {referralItem.label}
                        </span>
                        <span className="text-sm text-white/80">
                            Ganhe pontos indicando amigos
                        </span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-white/80" />
                </div>
            </motion.button>
        </div>
    );
};
