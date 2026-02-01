import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      position="top-center"
      offset={16}
      duration={3000}
      visibleToasts={1}
      expand={false}
      closeButton={false}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-[hsl(213_35%_16%)] group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-xl group-[.toaster]:shadow-black/40 group-[.toaster]:rounded-xl group-[.toaster]:px-4 group-[.toaster]:py-3 group-[.toaster]:min-h-[48px] group-[.toaster]:w-[calc(100vw-32px)] group-[.toaster]:max-w-[360px]",
          title: "group-[.toast]:text-sm group-[.toast]:font-medium",
          description: "group-[.toast]:text-xs group-[.toast]:text-muted-foreground group-[.toast]:mt-0.5",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          success: "group-[.toaster]:!bg-[hsl(160_60%_25%)] group-[.toaster]:!border-[hsl(160_60%_35%)] group-[.toaster]:!text-[hsl(160_80%_85%)] [&>[data-icon]]:!text-[hsl(160_80%_70%)]",
          error: "group-[.toaster]:!bg-[hsl(0_50%_25%)] group-[.toaster]:!border-[hsl(0_50%_35%)] group-[.toaster]:!text-[hsl(0_70%_85%)] [&>[data-icon]]:!text-[hsl(0_70%_70%)]",
          warning: "group-[.toaster]:!bg-[hsl(45_60%_25%)] group-[.toaster]:!border-[hsl(45_60%_35%)] group-[.toaster]:!text-[hsl(45_80%_85%)] [&>[data-icon]]:!text-[hsl(45_80%_70%)]",
          info: "group-[.toaster]:!bg-[hsl(200_50%_25%)] group-[.toaster]:!border-[hsl(200_50%_35%)] group-[.toaster]:!text-[hsl(200_70%_85%)] [&>[data-icon]]:!text-[hsl(200_70%_70%)]",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
