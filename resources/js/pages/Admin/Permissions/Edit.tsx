import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';

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

interface EditPermissionPageProps {
    permission: Permission;
}

export default function Edit({ permission }: EditPermissionPageProps) {
    const { data, setData, put, processing, errors } = useForm({
        name: permission.name,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('admin.permissions.update', permission.id));
    };

    return (
        <AppLayout>
            <Head title={`Редактировать разрешение: ${permission.name}`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href={route('admin.permissions.index')}>
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Назад
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Редактировать разрешение
                        </h1>
                        <p className="text-muted-foreground">
                            Изменить настройки разрешения "{permission.name}"
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        {/* Basic Information */}
                        <div className="lg:col-span-1">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Основная информация</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">
                                            Название разрешения *
                                        </Label>
                                        <Input
                                            id="name"
                                            value={data.name}
                                            onChange={(e) =>
                                                setData('name', e.target.value)
                                            }
                                            className={
                                                errors.name
                                                    ? 'border-red-500'
                                                    : ''
                                            }
                                            placeholder="Например: view users, create orders"
                                        />
                                        {errors.name && (
                                            <p className="text-sm text-red-500">
                                                {errors.name}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <Label className="text-sm font-medium">
                                            Группа
                                        </Label>
                                        <div className="mt-1 text-sm text-muted-foreground">
                                            {permission.group}
                                        </div>
                                    </div>

                                    <div>
                                        <Label className="text-sm font-medium">
                                            Guard
                                        </Label>
                                        <div className="mt-1 text-sm text-muted-foreground">
                                            {permission.guard_name}
                                        </div>
                                    </div>

                                    <div>
                                        <Label className="text-sm font-medium">
                                            Ролей
                                        </Label>
                                        <div className="mt-1 text-sm text-muted-foreground">
                                            {permission.roles.length} ролей
                                        </div>
                                    </div>

                                    <div>
                                        <Label className="text-sm font-medium">
                                            Создано
                                        </Label>
                                        <div className="mt-1 text-sm text-muted-foreground">
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
                                                    className="flex items-center space-x-2 rounded-md border p-2"
                                                >
                                                    <div className="h-2 w-2 rounded-full bg-blue-500" />
                                                    <span className="text-sm">
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

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-4">
                        <Link href={route('admin.permissions.index')}>
                            <Button variant="outline" type="button">
                                Отмена
                            </Button>
                        </Link>
                        <Button type="submit" disabled={processing}>
                            <Save className="mr-2 h-4 w-4" />
                            {processing
                                ? 'Сохранение...'
                                : 'Сохранить изменения'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
