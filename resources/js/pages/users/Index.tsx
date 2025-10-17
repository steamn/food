import Users from '@/actions/App/Http/Controllers/UserController';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { UserDeleteModal } from '@/components/users/UserDeleteModal';
import { UserFilters } from '@/components/users/UserFilters';
import { UserTable } from '@/components/users/UserTable';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Filter, Plus, Trash2, UserCheck, UserX } from 'lucide-react';
import { useState } from 'react';

interface User {
    id: number;
    name: string;
    email: string;
    phone?: string;
    avatar_url?: string;
    is_active: boolean;
    roles: string[];
    created_at: string;
    last_login_at?: string;
}

interface UsersPageProps {
    users: {
        data: User[];
        links: (typeof Link)[];
        meta: typeof Link;
    };
    filters: {
        search?: string;
        role?: string;
        status?: string;
        sort_by?: string;
        sort_direction?: string;
    };
    roles: string[];
}

export default function Index({ users, filters, roles }: UsersPageProps) {
    const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [showFilters, setShowFilters] = useState(false);

    const handleSearch = (search: string) => {
        router.get(
            Users.index(),
            { ...filters, search },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const handleFilter = (key: string, value: string) => {
        router.get(
            Users.index(),
            { ...filters, [key]: value },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const handleSort = (column: string) => {
        const direction =
            filters.sort_by === column && filters.sort_direction === 'asc'
                ? 'desc'
                : 'asc';
        router.get(
            Users.index(),
            { ...filters, sort_by: column, sort_direction: direction },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const handleSelectUser = (userId: number, checked: boolean) => {
        if (checked) {
            setSelectedUsers([...selectedUsers, userId]);
        } else {
            setSelectedUsers(selectedUsers.filter((id) => id !== userId));
        }
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedUsers(users.data.map((user) => user.id));
        } else {
            setSelectedUsers([]);
        }
    };

    const handleBulkAction = (action: string) => {
        if (selectedUsers.length === 0) return;

        router.post(
            Users.bulkAction(),
            {
                action,
                user_ids: selectedUsers,
            },
            {
                onSuccess: () => {
                    setSelectedUsers([]);
                },
            },
        );
    };

    const handleDeleteUser = (user: User) => {
        setUserToDelete(user);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        if (userToDelete) {
            router.delete(Users.destroy(userToDelete.id), {
                onSuccess: () => {
                    setShowDeleteModal(false);
                    setUserToDelete(null);
                },
            });
        }
    };

    return (
        <AppLayout>
            <Head title="Пользователи" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Пользователи
                        </h1>
                        <p className="text-muted-foreground">
                            Управление пользователями системы
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            <Filter className="mr-2 h-4 w-4" />
                            Фильтры
                        </Button>
                        <Link href={Users.create()}>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Добавить пользователя
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Filters */}
                {showFilters && (
                    <UserFilters
                        filters={filters}
                        roles={roles}
                        onFilter={handleFilter}
                        onSearch={handleSearch}
                    />
                )}

                {/* Bulk Actions */}
                {selectedUsers.length > 0 && (
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">
                                    Выбрано: {selectedUsers.length}{' '}
                                    пользователей
                                </span>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            handleBulkAction('activate')
                                        }
                                    >
                                        <UserCheck className="mr-2 h-4 w-4" />
                                        Активировать
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            handleBulkAction('deactivate')
                                        }
                                    >
                                        <UserX className="mr-2 h-4 w-4" />
                                        Деактивировать
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() =>
                                            handleBulkAction('delete')
                                        }
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Удалить
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Users Table */}
                <UserTable
                    users={users.data}
                    filters={filters}
                    selectedUsers={selectedUsers}
                    onSelectUser={handleSelectUser}
                    onSelectAll={handleSelectAll}
                    onSort={handleSort}
                    onDelete={handleDeleteUser}
                />

                {/* Pagination
                {users.meta?.last_page > 1 && (
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                            Показано {users.meta?.from} - {users.meta?.to} из{' '}
                            {users.meta.total} пользователей
                        </div>
                        <div className="flex items-center gap-2">
                            {users.links.map((link, index) => (
                                <Button
                                    key={index}
                                    variant={
                                        link.active ? 'default' : 'outline'
                                    }
                                    size="sm"
                                    disabled={!link.url}
                                    onClick={() =>
                                        link.url && router.get(link.url)
                                    }
                                    dangerouslySetInnerHTML={{
                                        __html: link.label,
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                )} */}
            </div>

            {/* Delete Modal */}
            <UserDeleteModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={confirmDelete}
                user={userToDelete}
            />
        </AppLayout>
    );
}
