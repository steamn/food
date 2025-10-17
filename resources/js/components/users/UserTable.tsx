import Users from '@/actions/App/Http/Controllers/UserController';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Link } from '@inertiajs/react';
import { ArrowUpDown, Edit, Eye, MoreHorizontal, Trash2 } from 'lucide-react';

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

interface UserTableProps {
    users: User[];
    filters: {
        search?: string;
        role?: string;
        status?: string;
        sort_by?: string;
        sort_direction?: string;
    };
    selectedUsers: number[];
    onSelectUser: (userId: number, checked: boolean) => void;
    onSelectAll: (checked: boolean) => void;
    onSort: (column: string) => void;
    onDelete: (user: User) => void;
}

export function UserTable({
    users,
    selectedUsers,
    onSelectUser,
    onSelectAll,
    onSort,
    onDelete,
}: UserTableProps) {
    const getRoleBadges = (roles: string[]) => {
        return roles.map((role) => (
            <Badge key={role} variant="outline" className="mr-1 text-xs">
                {role}
            </Badge>
        ));
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((word) => word.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const isAllSelected =
        users.length > 0 && selectedUsers.length === users.length;
    const isPartiallySelected =
        selectedUsers.length > 0 && selectedUsers.length < users.length;

    return (
        <div className="rounded-md border">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-muted/50">
                        <tr>
                            <th className="w-12 p-4">
                                <Checkbox
                                    checked={isAllSelected}
                                    ref={(el) => {
                                        if (el && 'indeterminate' in el)
                                            el.indeterminate =
                                                isPartiallySelected;
                                    }}
                                    onCheckedChange={onSelectAll}
                                />
                            </th>
                            <th className="p-4 text-left">
                                <Button
                                    variant="ghost"
                                    onClick={() => onSort('name')}
                                    className="h-auto p-0 font-semibold"
                                >
                                    Пользователь
                                    <ArrowUpDown className="ml-2 h-4 w-4" />
                                </Button>
                            </th>
                            <th className="p-4 text-left">
                                <Button
                                    variant="ghost"
                                    onClick={() => onSort('email')}
                                    className="h-auto p-0 font-semibold"
                                >
                                    Email
                                    <ArrowUpDown className="ml-2 h-4 w-4" />
                                </Button>
                            </th>
                            <th className="p-4 text-left">
                                <Button
                                    variant="ghost"
                                    onClick={() => onSort('roles')}
                                    className="h-auto p-0 font-semibold"
                                >
                                    Роли
                                    <ArrowUpDown className="ml-2 h-4 w-4" />
                                </Button>
                            </th>

                            <th className="p-4 text-left">
                                <Button
                                    variant="ghost"
                                    onClick={() => onSort('created_at')}
                                    className="h-auto p-0 font-semibold"
                                >
                                    Дата регистрации
                                    <ArrowUpDown className="ml-2 h-4 w-4" />
                                </Button>
                            </th>
                            <th className="p-4 text-left">
                                <Button
                                    variant="ghost"
                                    onClick={() => onSort('last_login_at')}
                                    className="h-auto p-0 font-semibold"
                                >
                                    Последний вход
                                    <ArrowUpDown className="ml-2 h-4 w-4" />
                                </Button>
                            </th>
                            <th className="w-12 p-4"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr
                                key={user.id}
                                className="border-t hover:bg-muted/50"
                            >
                                <td className="p-4">
                                    <Checkbox
                                        checked={selectedUsers.includes(
                                            user.id,
                                        )}
                                        onCheckedChange={(checked) =>
                                            onSelectUser(
                                                user.id,
                                                checked as boolean,
                                            )
                                        }
                                    />
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10">
                                            <AvatarImage
                                                src={user.avatar_url}
                                                alt={user.name}
                                            />
                                            <AvatarFallback>
                                                {getInitials(user.name)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="font-medium">
                                                {user.name}
                                            </div>
                                            {user.phone && (
                                                <div className="text-sm text-muted-foreground">
                                                    {user.phone}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className="text-sm">{user.email}</div>
                                </td>
                                <td className="p-4">
                                    <div className="flex flex-wrap gap-1">
                                        {getRoleBadges(user.roles)}
                                    </div>
                                </td>

                                <td className="p-4">
                                    <div className="text-sm text-muted-foreground">
                                        {new Date(
                                            user.created_at,
                                        ).toLocaleDateString('ru-RU')}
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className="text-sm text-muted-foreground">
                                        {user.last_login_at
                                            ? new Date(
                                                  user.last_login_at,
                                              ).toLocaleDateString('ru-RU')
                                            : 'Никогда'}
                                    </div>
                                </td>
                                <td className="p-4">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem asChild>
                                                <Link
                                                    className="cursor-pointer"
                                                    href={Users.show(user.id)}
                                                >
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    Просмотр
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem asChild>
                                                <Link
                                                    className="cursor-pointer"
                                                    href={Users.edit(user.id)}
                                                >
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    Редактировать
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => onDelete(user)}
                                                className="cursor-pointer text-red-600"
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Удалить
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
