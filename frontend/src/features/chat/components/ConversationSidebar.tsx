import { useState } from 'react';
import { Plus, MessageSquare, Trash2, Edit2, Check, X } from 'lucide-react';
import type { ConversationItem } from '../../../types/chat.types';
import { cn } from '../../../lib/utils';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';

interface ConversationSidebarProps {
    conversations: ConversationItem[];
    activeConversationId: string | null;
    onSelectConversation: (id: string) => void;
    onCreateConversation: () => void;
    onUpdateTitle: (id: string, newTitle: string) => void;
    onDeleteConversation: (id: string) => void;
}

export function ConversationSidebar({
    conversations,
    activeConversationId,
    onSelectConversation,
    onCreateConversation,
    onUpdateTitle,
    onDeleteConversation,
}: ConversationSidebarProps) {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState('');
    const [deletingConv, setDeletingConv] = useState<ConversationItem | null>(null);

    const handleStartEdit = (conv: ConversationItem) => {
        setEditingId(conv.id);
        setEditTitle(conv.title || 'Conversation');
    };

    const handleSaveEdit = (id: string) => {
        if (editTitle.trim()) {
            onUpdateTitle(id, editTitle.trim());
        }
        setEditingId(null);
    };

    const handleConfirmDelete = () => {
        if (deletingConv) {
            onDeleteConversation(deletingConv.id);
            setDeletingConv(null);
        }
    };

    return (
        <aside className="flex h-full w-72 flex-col border-r border-[#D5DBE2] bg-[#F8FAFC]">
            <div className="p-4 border-b border-[#D5DBE2]">
                <button
                    onClick={onCreateConversation}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#8C221A] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#731A13] transition cursor-pointer shadow-xs active:scale-[0.99]"
                >
                    <Plus className="h-4 w-4" />
                    <span>New Chat</span>
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-1">
                {conversations.length === 0 ? (
                    <p className="p-4 text-center text-xs text-[#67788A]">No previous conversations.</p>
                ) : (
                    conversations.map((conv) => {
                        const isActive = conv.id === activeConversationId;
                        const isEditing = conv.id === editingId;

                        return (
                            <div
                                key={conv.id}
                                onClick={() => !isEditing && onSelectConversation(conv.id)}
                                className={cn(
                                    'group flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition cursor-pointer',
                                    isActive
                                        ? 'bg-[#F4EAEB] text-[#8C221A] font-semibold border border-[#8C221A]/20 shadow-xs'
                                        : 'text-[#34424F] hover:bg-[#EAEEF2] hover:text-[#121921] border border-transparent',
                                )}
                            >
                                {isEditing ? (
                                    <div className="flex flex-1 items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                        <input
                                            type="text"
                                            value={editTitle}
                                            onChange={(e) => setEditTitle(e.target.value)}
                                            className="w-full rounded border border-[#D5DBE2] bg-white px-2 py-1 text-xs text-[#121921] focus:outline-none focus:border-[#8C221A]"
                                            autoFocus
                                        />
                                        <button
                                            onClick={() => handleSaveEdit(conv.id)}
                                            className="p-1 text-emerald-600 hover:text-emerald-700"
                                        >
                                            <Check className="h-3.5 w-3.5" />
                                        </button>
                                        <button
                                            onClick={() => setEditingId(null)}
                                            className="p-1 text-[#67788A] hover:text-[#121921]"
                                        >
                                            <X className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex items-center gap-2 truncate">
                                            <MessageSquare className={cn("h-3.5 w-3.5 shrink-0", isActive ? "text-[#8C221A]" : "text-[#67788A]")} />
                                            <span className="truncate">{conv.title || 'Untitled Conversation'}</span>
                                        </div>

                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleStartEdit(conv);
                                                }}
                                                className="p-1 text-[#67788A] hover:text-[#8C221A]"
                                            >
                                                <Edit2 className="h-3 w-3" />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setDeletingConv(conv);
                                                }}
                                                title="Delete chat"
                                                className="p-1 text-[#67788A] hover:text-rose-600 transition"
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            <ConfirmationModal
                isOpen={deletingConv !== null}
                title="Delete Conversation"
                description={
                    <span>
                        Are you sure you want to delete <strong className="text-[#121921] font-semibold">{deletingConv?.title || 'this conversation'}</strong>? All messages, answers, and source citations in this thread will be permanently deleted. This action cannot be undone.
                    </span>
                }
                confirmText="Delete Chat"
                cancelText="Cancel"
                variant="danger"
                icon={<Trash2 className="h-5 w-5" />}
                onConfirm={handleConfirmDelete}
                onCancel={() => setDeletingConv(null)}
            />
        </aside>
    );
}