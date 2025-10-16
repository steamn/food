import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import Permissions from '@/routes/admin/permissions';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowUpDown, Edit, Eye, Plus, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface Permission {
    id: number;
    name: string;
    guard_name: string;
    created_at: string;
    updated_at: string;
    group: string;
    roles: Array<{
        id: number;
        name: string;
    }>;
    roles_count: number;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PermissionsPageProps {
    permissions: {
        data?: Permission[];
        links: PaginationLink[];
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
        group?: string;
        sort_by?: string;
        sort_direction?: string;
    };
    groups: string[];
}

export default function Index({
    permissions,
    filters,
    groups,
}: PermissionsPageProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [group] = useState(filters.group || 'all');
    const [sortBy, setSortBy] = useState(filters.sort_by || 'name');
    const [sortDirection, setSortDirection] = useState(
        filters.sort_direction || 'asc',
    );

    const handleSearch = (value: string) => {
        setSearch(value);
        router.get(
            Permissions.index(),
            { ...filters, search: value },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const handleFilter = (key: string, value: string) => {
        const filterValue = value === 'all' ? '' : value;
        router.get(
            Permissions.index(),
            { ...filters, [key]: filterValue },
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
            Permissions.index(),
            { ...filters, sort_by: column, sort_direction: newDirection },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const handleDelete = (permission: Permission) => {
        if (
            confirm(
                `Вы уверены, что хотите удалить разрешение "${permission.name}"?`,
            )
        ) {
            router.delete(Permissions.destroy(permission.id));
        }
    };

    const getGroupBadge = (groupName: string) => {
        const colors = {
            view: 'bg-blue-100 text-blue-800',
            create: 'bg-green-100 text-green-800',
            edit: 'bg-yellow-100 text-yellow-800',
            delete: 'bg-red-100 text-red-800',
            manage: 'bg-purple-100 text-purple-800',
        };

        return (
            <Badge
                variant="outline"
                className={
                    colors[groupName as keyof typeof colors] ||
                    'bg-gray-100 text-gray-800'
                }
            >
                {groupName}
            </Badge>
        );
    };

    return (
        <AppLayout>
            <Head title="Разрешения" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Разрешения
                        </h1>
                        <p className="text-muted-foreground">
                            Управление разрешениями системы
                        </p>
                    </div>
                    <Link href={Permissions.create()}>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Добавить разрешение
                        </Button>
                    </Link>
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                            <div className="space-y-2">
                                <Label htmlFor="search">Поиск</Label>
                                <div className="relative">
                                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                                    <Input
                                        id="search"
                                        placeholder="Поиск по названию..."
                                        value={search}
                                        onChange={(e) =>
                                            handleSearch(e.target.value)
                                        }
                                        className="pl-10"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="group">Группа</Label>
                                <Select
                                    value={group}
                                    onValueChange={(value) =>
                                        handleFilter('group', value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Все группы" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            Все группы
                                        </SelectItem>
                                        {groups.map((groupName) => (
                                            <SelectItem
                                                key={groupName}
                                                value={groupName}
                                            >
                                                {groupName}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
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
                                        <SelectItem value="roles_count">
                                            По количеству ролей
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

                {/* Permissions Table */}
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
                                            Группа
                                        </th>
                                        <th className="p-4 text-left">Роли</th>
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
                                    {Array.isArray(permissions.data) &&
                                    permissions.data.length > 0 ? (
                                        permissions.data.map((permission) => (
                                            <tr
                                                key={permission.id}
                                                className="border-t hover:bg-muted/50"
                                            >
                                                <td className="p-4">
                                                    <div className="font-medium">
                                                        {permission.name}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {permission.guard_name}
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    {getGroupBadge(
                                                        permission.group,
                                                    )}
                                                </td>
                                                <td className="p-4">
                                                    <div className="text-sm">
                                                        {permission.roles_count}{' '}
                                                        ролей
                                                    </div>
                                                    <div className="mt-1 flex flex-wrap gap-1">
                                                        {permission.roles
                                                            .slice(0, 3)
                                                            .map((role) => (
                                                                <Badge
                                                                    key={
                                                                        role.id
                                                                    }
                                                                    variant="outline"
                                                                    className="text-xs"
                                                                >
                                                                    {role.name}
                                                                </Badge>
                                                            ))}
                                                        {permission.roles
                                                            .length > 3 && (
                                                            <Badge
                                                                variant="outline"
                                                                className="text-xs"
                                                            >
                                                                +
                                                                {permission
                                                                    .roles
                                                                    .length - 3}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="text-sm text-muted-foreground">
                                                        {new Date(
                                                            permission.created_at,
                                                        ).toLocaleDateString(
                                                            'ru-RU',
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-2">
                                                        <Link
                                                            href={Permissions.show(
                                                                permission.id,
                                                            )}
                                                            className="text-blue-600 hover:text-blue-900"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Link>
                                                        <Link
                                                            href={Permissions.edit(
                                                                permission.id,
                                                            )}
                                                            className="text-indigo-600 hover:text-indigo-900"
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Link>
                                                        <button
                                                            onClick={() =>
                                                                handleDelete(
                                                                    permission,
                                                                )
                                                            }
                                                            className="text-red-600 hover:text-red-900"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan={5}
                                                className="p-8 text-center text-muted-foreground"
                                            >
                                                Разрешения не найдены
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* Pagination */}
                {permissions.meta.last_page > 1 && (
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                            Показано {permissions.meta.from} -{' '}
                            {permissions.meta.to} из {permissions.meta.total}{' '}
                            разрешений
                        </div>
                        <Pagination>
                            <PaginationContent>
                                {/* Previous button */}
                                {permissions.links[0]?.url && (
                                    <PaginationItem>
                                        <PaginationPrevious
                                            href={permissions.links[0].url}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                router.get(
                                                    permissions.links[0].url!,
                                                );
                                            }}
                                        />
                                    </PaginationItem>
                                )}

                                {/* Page numbers */}
                                {permissions.links
                                    .slice(1, -1)
                                    .map((link, index) => {
                                        // Обрабатываем многоточие
                                        if (link.label === '...') {
                                            return (
                                                <PaginationItem key={index + 1}>
                                                    <PaginationEllipsis />
                                                </PaginationItem>
                                            );
                                        }

                                        // Обрабатываем обычные страницы
                                        return (
                                            <PaginationItem key={index + 1}>
                                                <PaginationLink
                                                    href={link.url || undefined}
                                                    isActive={link.active}
                                                    onClick={(e) => {
                                                        if (link.url) {
                                                            e.preventDefault();
                                                            router.get(
                                                                link.url,
                                                            );
                                                        }
                                                    }}
                                                >
                                                    {link.label}
                                                </PaginationLink>
                                            </PaginationItem>
                                        );
                                    })}

                                {/* Next button */}
                                {permissions.links[permissions.links.length - 1]
                                    ?.url && (
                                    <PaginationItem>
                                        <PaginationNext
                                            href={
                                                permissions.links[
                                                    permissions.links.length - 1
                                                ].url!
                                            }
                                            onClick={(e) => {
                                                e.preventDefault();
                                                router.get(
                                                    permissions.links[
                                                        permissions.links
                                                            .length - 1
                                                    ].url!,
                                                );
                                            }}
                                        />
                                    </PaginationItem>
                                )}
                            </PaginationContent>
                        </Pagination>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
