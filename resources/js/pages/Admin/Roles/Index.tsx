import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowUpDown, Edit, Eye, Plus, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface Role {
    id: number;
    name: string;
    guard_name: string;
    created_at: string;
    updated_at: string;
    permissions: Array<{
        id: number;
        name: string;
    }>;
    permissions_count: number;
    users_count: number;
}

interface RolesPageProps {
    roles: {
        data: Role[];
        links: any[];
        meta: {
            current_page: number;
            from: number;
            last_page: number;
            per_page: number;
            to: number;
            total: number;
        };
    };
    filters: {
        search?: string;
        sort_by?: string;
        sort_direction?: string;
    };
}

export default function Index({ roles, filters }: RolesPageProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [sortBy, setSortBy] = useState(filters.sort_by || 'name');
    const [sortDirection, setSortDirection] = useState(
        filters.sort_direction || 'asc',
    );

    const handleSearch = (value: string) => {
        setSearch(value);
        router.get(
            route('admin.roles.index'),
            { ...filters, search: value },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const handleSort = (column: string) => {
        const newDirection =
            sortBy === column && sortDirection === 'asc' ? 'desc' : 'asc';
        setSortBy(column);
        setSortDirection(newDirection);
        router.get(
            route('admin.roles.index'),
            { ...filters, sort_by: column, sort_direction: newDirection },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const handleDelete = (role: Role) => {
        if (role.name === 'super-admin') {
            alert('Нельзя удалить роль super-admin.');
            return;
        }

        if (confirm(`Вы уверены, что хотите удалить роль "${role.name}"?`)) {
            router.delete(route('admin.roles.destroy', role.id));
        }
    };

    const getRoleBadge = (roleName: string) => {
        const colors = {
            'super-admin': 'bg-red-100 text-red-800',
            admin: 'bg-blue-100 text-blue-800',
            courier: 'bg-green-100 text-green-800',
            customer: 'bg-gray-100 text-gray-800',
        };

        return (
            <Badge
                variant="outline"
                className={
                    colors[roleName as keyof typeof colors] ||
                    'bg-gray-100 text-gray-800'
                }
            >
                {roleName}
            </Badge>
        );
    };

    return (
        <AppLayout>
            <Head title="Роли" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Роли
                        </h1>
                        <p className="text-muted-foreground">
                            Управление ролями и разрешениями системы
                        </p>
                    </div>
                    <Link href={route('admin.roles.create')}>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Добавить роль
                        </Button>
                    </Link>
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <div className="space-y-2">
                                <Label htmlFor="search">Поиск</Label>
                                <div className="relative">
                                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                                    <Input
                                        id="search"
                                        placeholder="Поиск по названию роли..."
                                        value={search}
                                        onChange={(e) =>
                                            handleSearch(e.target.value)
                                        }
                                        className="pl-10"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="sort">Сортировка</Label>
                                <Select
                                    value={sortBy}
                                    onValueChange={(value) => handleSort(value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="name">
                                            По названию
                                        </SelectItem>
                                        <SelectItem value="created_at">
                                            По дате создания
                                        </SelectItem>
                                        <SelectItem value="permissions_count">
                                            По количеству разрешений
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Направление</Label>
                                <div className="flex gap-2">
                                    <Button
                                        variant={
                                            sortDirection === 'asc'
                                                ? 'default'
                                                : 'outline'
                                        }
                                        size="sm"
                                        onClick={() => handleSort(sortBy)}
                                    >
                                        <ArrowUpDown className="mr-2 h-4 w-4" />
                                        {sortDirection === 'asc'
                                            ? 'По возрастанию'
                                            : 'По убыванию'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Roles Table */}
                <Card>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-muted/50">
                                    <tr>
                                        <th className="p-4 text-left">
                                            <Button
                                                variant="ghost"
                                                onClick={() =>
                                                    handleSort('name')
                                                }
                                                className="h-auto p-0 font-semibold"
                                            >
                                                Название
                                                <ArrowUpDown className="ml-2 h-4 w-4" />
                                            </Button>
                                        </th>
                                        <th className="p-4 text-left">
                                            Разрешения
                                        </th>
                                        <th className="p-4 text-left">
                                            Пользователи
                                        </th>
                                        <th className="p-4 text-left">
                                            <Button
                                                variant="ghost"
                                                onClick={() =>
                                                    handleSort('created_at')
                                                }
                                                className="h-auto p-0 font-semibold"
                                            >
                                                Дата создания
                                                <ArrowUpDown className="ml-2 h-4 w-4" />
                                            </Button>
                                        </th>
                                        <th className="w-12 p-4"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {roles.data.map((role) => (
                                        <tr
                                            key={role.id}
                                            className="border-t hover:bg-muted/50"
                                        >
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    {getRoleBadge(role.name)}
                                                    <div>
                                                        <div className="font-medium">
                                                            {role.name}
                                                        </div>
                                                        <div className="text-sm text-muted-foreground">
                                                            {role.guard_name}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="text-sm">
                                                    {role.permissions_count}{' '}
                                                    разрешений
                                                </div>
                                                <div className="mt-1 flex flex-wrap gap-1">
                                                    {role.permissions
                                                        .slice(0, 3)
                                                        .map((permission) => (
                                                            <Badge
                                                                key={
                                                                    permission.id
                                                                }
                                                                variant="outline"
                                                                className="text-xs"
                                                            >
                                                                {
                                                                    permission.name
                                                                }
                                                            </Badge>
                                                        ))}
                                                    {role.permissions.length >
                                                        3 && (
                                                        <Badge
                                                            variant="outline"
                                                            className="text-xs"
                                                        >
                                                            +
                                                            {role.permissions
                                                                .length - 3}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="text-sm">
                                                    {role.users_count}{' '}
                                                    пользователей
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="text-sm text-muted-foreground">
                                                    {new Date(
                                                        role.created_at,
                                                    ).toLocaleDateString(
                                                        'ru-RU',
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <Link
                                                        href={route(
                                                            'admin.roles.show',
                                                            role.id,
                                                        )}
                                                        className="text-blue-600 hover:text-blue-900"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Link>
                                                    <Link
                                                        href={route(
                                                            'admin.roles.edit',
                                                            role.id,
                                                        )}
                                                        className="text-indigo-600 hover:text-indigo-900"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Link>
                                                    {role.name !==
                                                        'super-admin' && (
                                                        <button
                                                            onClick={() =>
                                                                handleDelete(
                                                                    role,
                                                                )
                                                            }
                                                            className="text-red-600 hover:text-red-900"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* Pagination */}
                {roles.meta.last_page > 1 && (
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                            Показано {roles.meta.from} - {roles.meta.to} из{' '}
                            {roles.meta.total} ролей
                        </div>
                        <div className="flex items-center gap-2">
                            {roles.links.map((link, index) => (
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
                )}
            </div>
        </AppLayout>
    );
}
