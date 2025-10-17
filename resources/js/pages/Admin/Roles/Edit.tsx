import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import Roles from '@/routes/admin/roles';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Permission {
    id: number;
    name: string;
}

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
}

interface EditRolePageProps {
    role: Role;
    permissions: Record<string, Permission[]>;
}

export default function Edit({ role, permissions }: EditRolePageProps) {
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>(
        role.permissions.map((p: Permission) => p.name),
    );

    const { data, setData, put, processing, errors } = useForm({
        name: role.name,
        permissions: role.permissions.map((p: Permission) => p.name),
    });

    useEffect(() => {
        setData('permissions', selectedPermissions);
    }, [selectedPermissions]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(Roles.update(role.id).url);
        router.visit(Roles.index().url, {
            only: ['roles'],
            preserveState: true,
            replace: true,
        });
    };

    const handlePermissionChange = (
        permissionName: string,
        checked: boolean,
    ) => {
        if (checked) {
            setSelectedPermissions([...selectedPermissions, permissionName]);
        } else {
            setSelectedPermissions(
                selectedPermissions.filter((p) => p !== permissionName),
            );
        }
    };

    const handleGroupSelect = (group: string, checked: boolean) => {
        const groupPermissions = permissions[group] || [];
        const groupPermissionNames = groupPermissions.map((p) => p.name);

        if (checked) {
            const newPermissions = [
                ...new Set([...selectedPermissions, ...groupPermissionNames]),
            ];
            setSelectedPermissions(newPermissions);
        } else {
            const newPermissions = selectedPermissions.filter(
                (p) => !groupPermissionNames.includes(p),
            );
            setSelectedPermissions(newPermissions);
        }
    };

    const isGroupSelected = (group: string) => {
        const groupPermissions = permissions[group] || [];
        return groupPermissions.every((p) =>
            selectedPermissions.includes(p.name),
        );
    };

    const isGroupPartiallySelected = (group: string) => {
        const groupPermissions = permissions[group] || [];
        const selectedInGroup = groupPermissions.filter((p) =>
            selectedPermissions.includes(p.name),
        );
        return (
            selectedInGroup.length > 0 &&
            selectedInGroup.length < groupPermissions.length
        );
    };

    return (
        <AppLayout>
            <Head title={`Редактировать роль: ${role.name}`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href={Roles.index().url}>
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Назад
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Редактировать роль
                        </h1>
                        <p className="text-muted-foreground">
                            Изменить настройки роли "{role.name}"
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
                                            Название роли *
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
                                            placeholder="Введите название роли"
                                        />
                                        {errors.name && (
                                            <p className="text-sm text-red-500">
                                                {errors.name}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Выбрано разрешений</Label>
                                        <div className="text-sm text-muted-foreground">
                                            {selectedPermissions.length} из{' '}
                                            {
                                                Object.values(
                                                    permissions,
                                                ).flat().length
                                            }
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Информация о роли</Label>
                                        <div className="space-y-1 text-sm text-muted-foreground">
                                            <div>Guard: {role.guard_name}</div>
                                            <div>
                                                Создана:{' '}
                                                {new Date(
                                                    role.created_at,
                                                ).toLocaleDateString('ru-RU')}
                                            </div>
                                            <div>
                                                Обновлена:{' '}
                                                {new Date(
                                                    role.updated_at,
                                                ).toLocaleDateString('ru-RU')}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Permissions */}
                        <div className="lg:col-span-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Разрешения</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {Object.entries(permissions).map(
                                        ([group, groupPermissions]) => (
                                            <div
                                                key={group}
                                                className="space-y-3"
                                            >
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`group-${group}`}
                                                        checked={isGroupSelected(
                                                            group,
                                                        )}
                                                        ref={(el) => {
                                                            if (el) {
                                                                (
                                                                    el as HTMLInputElement
                                                                ).indeterminate =
                                                                    isGroupPartiallySelected(
                                                                        group,
                                                                    );
                                                            }
                                                        }}
                                                        onCheckedChange={(
                                                            checked,
                                                        ) =>
                                                            handleGroupSelect(
                                                                group,
                                                                checked as boolean,
                                                            )
                                                        }
                                                    />
                                                    <Label
                                                        htmlFor={`group-${group}`}
                                                        className="text-sm font-medium capitalize"
                                                    >
                                                        {group} (
                                                        {
                                                            groupPermissions.length
                                                        }
                                                        )
                                                    </Label>
                                                </div>

                                                <div className="ml-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
                                                    {groupPermissions.map(
                                                        (permission) => (
                                                            <div
                                                                key={
                                                                    permission.id
                                                                }
                                                                className="flex items-center space-x-2"
                                                            >
                                                                <Checkbox
                                                                    id={`permission-${permission.id}`}
                                                                    checked={selectedPermissions.includes(
                                                                        permission.name,
                                                                    )}
                                                                    onCheckedChange={(
                                                                        checked,
                                                                    ) =>
                                                                        handlePermissionChange(
                                                                            permission.name,
                                                                            checked as boolean,
                                                                        )
                                                                    }
                                                                />
                                                                <Label
                                                                    htmlFor={`permission-${permission.id}`}
                                                                    className="text-sm"
                                                                >
                                                                    {
                                                                        permission.name
                                                                    }
                                                                </Label>
                                                            </div>
                                                        ),
                                                    )}
                                                </div>
                                            </div>
                                        ),
                                    )}

                                    {errors.permissions && (
                                        <p className="text-sm text-red-500">
                                            {errors.permissions}
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-4">
                        <Link href={Roles.index().url}>
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
