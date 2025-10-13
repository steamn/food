import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Edit, Trash2, Users } from 'lucide-react';

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
}

interface ShowPermissionPageProps {
    permission: Permission;
}

export default function Show({ permission }: ShowPermissionPageProps) {
    const handleDelete = () => {
        if (
            confirm(
                `Вы уверены, что хотите удалить разрешение "${permission.name}"?`,
            )
        ) {
            // This would be handled by a delete button with proper form submission
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
            <Head title={`Разрешение: ${permission.name}`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={route('admin.permissions.index')}>
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Назад
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">
                                {permission.name}
                            </h1>
                            <p className="text-muted-foreground">
                                Детальная информация о разрешении
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link
                            href={route(
                                'admin.permissions.edit',
                                permission.id,
                            )}
                        >
                            <Button variant="outline">
                                <Edit className="mr-2 h-4 w-4" />
                                Редактировать
                            </Button>
                        </Link>
                        <Button variant="destructive" onClick={handleDelete}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Удалить
                        </Button>
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
                                    <div className="mt-1">
                                        {permission.name}
                                    </div>
                                </div>

                                <div>
                                    <Label className="text-sm font-medium">
                                        Группа
                                    </Label>
                                    <div className="mt-1">
                                        {getGroupBadge(permission.group)}
                                    </div>
                                </div>

                                <div>
                                    <Label className="text-sm font-medium">
                                        Guard
                                    </Label>
                                    <div className="mt-1">
                                        {permission.guard_name}
                                    </div>
                                </div>

                                <div>
                                    <Label className="text-sm font-medium">
                                        Ролей
                                    </Label>
                                    <div className="mt-1 flex items-center gap-2">
                                        <Users className="h-4 w-4" />
                                        {permission.roles.length} ролей
                                    </div>
                                </div>

                                <div>
                                    <Label className="text-sm font-medium">
                                        Создано
                                    </Label>
                                    <div className="mt-1">
                                        {new Date(
                                            permission.created_at,
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
                                        Обновлено
                                    </Label>
                                    <div className="mt-1">
                                        {new Date(
                                            permission.updated_at,
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

                    {/* Roles */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    Роли с этим разрешением (
                                    {permission.roles.length})
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {permission.roles.length > 0 ? (
                                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                        {permission.roles.map((role) => (
                                            <div
                                                key={role.id}
                                                className="flex items-center space-x-2 rounded-md border p-3"
                                            >
                                                <div className="h-2 w-2 rounded-full bg-blue-500" />
                                                <span className="text-sm font-medium">
                                                    {role.name}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-8 text-center text-muted-foreground">
                                        Это разрешение не назначено ни одной
                                        роли
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
