import { useNavigate } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import PostForm from "../components/PostForm";

export default function CreatePostMobilePage() {
    const navigate = useNavigate();

    return (
        <div className="h-screen bg-white flex flex-col overflow-hidden">
            {/* Header */}
            <div className="shrink-0 z-40 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
                <button onClick={() => navigate(-1)} className="font-hand text-lg hover:text-[var(--primary)] flex items-center gap-2">
                    <FiArrowLeft className="text-xl" /> Back
                </button>
                <div className="font-sketch text-xl">New Scribble</div>
                <div className="w-8"></div> {/* Spacer for centering */}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-4 py-6 scrollbar-hide pb-24">
                <PostForm onPosted={() => navigate("/dashboard")} />
            </div>
        </div>
    );
}
