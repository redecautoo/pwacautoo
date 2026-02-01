import React from "react";
import { useApp } from "@/contexts/AppContext";
import SuccessModal from "@/components/SuccessModal";

const GlobalAlert = () => {
    const { alertModal, hideAlert } = useApp();

    return (
        <SuccessModal
            isOpen={alertModal.isOpen}
            onClose={hideAlert}
            title={alertModal.title}
            description={alertModal.description}
            variant={alertModal.variant}
            highlightText={alertModal.highlightText}
        />
    );
};

export default GlobalAlert;
