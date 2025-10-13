import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Edit, Trash2, Users } from 'lucide-react';

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
    users_count: number;
}

interface ShowRolePageProps {
    role: Role;
}

export default function Show({ role }: ShowRolePageProps) {
    const handleDelete = () => {
        if (role.name === 'super-admin') {
            alert('Нельзя удалить роль super-admin.');
            return;
        }

        if (confirm(`Вы уверены, что хотите удалить роль "${role.name}"?`)) {
            // This would be handled by a delete button with proper form submission
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

    const groupedPermissions = role.permissions.reduce(
        (acc, permission) => {
            const group = permission.name.split(' ')[0];
            if (!acc[group]) {
                acc[group] = [];
            }
            acc[group].push(permission);
            return acc;
        },
        {} as Record<string, typeof role.permissions>,
    );

    return (
        <AppLayout>
            <Head title={`Роль: ${role.name}`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={route('admin.roles.index')}>
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Назад
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">
                                {getRoleBadge(role.name)}
                            </h1>
                            <p className="text-muted-foreground">
                                Детальная информация о роли
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link href={route('admin.roles.edit', role.id)}>
                            <Button variant="outline">
                                <Edit className="mr-2 h-4 w-4" />
                                Редактировать
                            </Button>
                        </Link>
                        {role.name !== 'super-admin' && (
                            <Button
                                variant="destructive"
                                onClick={handleDelete}
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Удалить
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Basic Information */}
                    <div className="lg:col-span-1">
                        <Card>
                            <CardHeader>
                                <CardTitle>Основная информация</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label className="text-sm font-medium">
                                        Название
                                    </Label>
                                    <div className="mt-1">{role.name}</div>
                                </div>

                                <div>
                                    <Label className="text-sm font-medium">
                                        Guard
                                    </Label>
                                    <div className="mt-1">
                                        {role.guard_name}
                                    </div>
                                </div>

                                <div>
                                    <Label className="text-sm font-medium">
                                        Пользователей
                                    </Label>
                                    <div className="mt-1 flex items-center gap-2">
                                        <Users className="h-4 w-4" />
                                        {role.users_count} пользователей
                                    </div>
                                </div>

                                <div>
                                    <Label className="text-sm font-medium">
                                        Разрешений
                                    </Label>
                                    <div className="mt-1">
                                        {role.permissions.length} разрешений
                                    </div>
                                </div>

                                <div>
                                    <Label className="text-sm font-medium">
                                        Создана
                                    </Label>
                                    <div className="mt-1">
                                        {new Date(
                                            role.created_at,
                                        ).toLocaleDateString('ru-RU', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </div>
                                </div>

                                <div>
                                    <Label className="text-sm font-medium">
                                        Обновлена
                                    </Label>
                                    <div className="mt-1">
                                        {new Date(
                                            role.updated_at,
                                        ).toLocaleDateString('ru-RU', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Permissions */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    Разрешения ({role.permissions.length})
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {Object.entries(groupedPermissions).map(
                                    ([group, groupPermissions]) => (
                                        <div key={group} className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <h4 className="text-sm font-medium capitalize">
                                                    {group}
                                                </h4>
                                                <Badge
                                                    variant="outline"
                                                    className="text-xs"
                                                >
                                                    {groupPermissions.length}
                                                </Badge>
                                            </div>

                                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                                {groupPermissions.map(
                                                    (permission) => (
                                                        <div
                                                            key={permission.id}
                                                            className="flex items-center space-x-2 rounded-md border p-2"
                                                        >
                                                            <div className="h-2 w-2 rounded-full bg-green-500" />
                                                            <span className="text-sm">
                                                                {
                                                                    permission.name
                                                                }
                                                            </span>
                                                        </div>
                                                    ),
                                                )}
                                            </div>
                                        </div>
                                    ),
                                )}

                                {role.permissions.length === 0 && (
                                    <div className="py-8 text-center text-muted-foreground">
                                        У этой роли нет разрешений
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

function Label({
    className,
    children,
    ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
    return (
        <label
            className={`text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`}
            {...props}
        >
            {children}
        </label>
    );
}
