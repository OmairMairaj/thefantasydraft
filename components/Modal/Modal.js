import { Exo_2 } from 'next/font/google';

const exo2 = Exo_2({
    weight: ['400', '500', '700', '800'],
    style: ['italic'],
    subsets: ['latin'],
});

const Modal = ({ onClose, title, children }) => {
    return (
        <div className={`fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-70 ${exo2.className}`}>
            <div className="bg-gradient-to-r from-[#0C1922] to-[#0C192250] backdrop-blur-sm rounded-lg p-6 w-[90%] max-w-lg overflow-hidden">
                {/* Modal Header */}
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl xl:text-2xl font-semibold">{title}</h2>
                    <button
                        onClick={onClose}
                        className="px-2 text-gray-400 hover:text-white focus:outline-none"
                    >
                        &#x2715;
                    </button>
                </div>

                {/* Modal Content */}
                <div className="flex flex-col max-h-[60%] overflow-y-auto scrollbar">{children}</div>
            </div>
        </div>
    );
};

export default Modal;
