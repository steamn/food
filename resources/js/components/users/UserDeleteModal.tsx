import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { AlertTriangle } from 'lucide-react';

interface User {
    id: number;
    name: string;
    email: string;
}

interface UserDeleteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    user: User | null;
}

export function UserDeleteModal({
    isOpen,
    onClose,
    onConfirm,
    user,
}: UserDeleteModalProps) {
    if (!user) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="flex-shrink-0">
                            <AlertTriangle className="h-6 w-6 text-red-600" />
                        </div>
                        <div>
                            <DialogTitle>Удалить пользователя</DialogTitle>
                            <DialogDescription>
                                Это действие нельзя отменить. Пользователь будет
                                полностью удален из системы.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="py-4">
                    <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                        <h4 className="mb-2 font-medium text-red-900">
                            Вы уверены, что хотите удалить этого пользователя?
                        </h4>
                        <div className="text-sm text-red-700">
                            <p>
                                <strong>Имя:</strong> {user.name}
                            </p>
                            <p>
                                <strong>Email:</strong> {user.email}
                            </p>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Отмена
                    </Button>
                    <Button variant="destructive" onClick={onConfirm}>
                        Удалить пользователя
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
