const Modal = ({ onClose, title, children }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-[#1C1C1C] rounded-lg p-6 w-[90%] max-w-lg overflow-hidden">
                {/* Modal Header */}
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-white text-xl">{title}</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white focus:outline-none"
                    >
                        &#x2715;
                    </button>
                </div>

                {/* Modal Content */}
                <div className="flex flex-col max-h-[60%]">{children}</div>
            </div>
        </div>
    );
};

export default Modal;
