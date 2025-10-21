"use client";

export default function Modal({
    title,
    description,
    onCancel,
    onConfirm,
}: {
    title: string;
    description: string;
    onCancel: () => void;
    onConfirm: () => void;
}) {
    return (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg w-[90%] max-w-sm shadow-lg">
                <h2 className="text-lg font-semibold mb-2">{title}</h2>
                <p className="text-gray-600 text-sm mb-4">{description}</p>
                <div className="flex justify-end gap-3">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 rounded bg-gray-100 text-gray-800 hover:bg-gray-200"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 transition"
                    >
                        Delete
                    </button>

                </div>
            </div>
        </div>
    );
}
