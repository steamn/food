import Users from '@/actions/App/Http/Controllers/UserController';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    Calendar,
    Edit,
    Mail,
    MapPin,
    Phone,
    Settings,
    Trash2,
    Truck,
    User,
    UserCheck,
    UserX,
} from 'lucide-react';
import { useState } from 'react';

interface ShowUserPageProps {
    user: {
        id: number;
        name: string;
        email: string;
        phone: string | null;
        avatar: string | null;
        bio: string | null;
        birth_date: string | null;
        gender: string | null;
        default_address: string | null;
        default_latitude: string | null;
        default_longitude: string | null;
        email_notifications: boolean;
        sms_notifications: boolean;
        push_notifications: boolean;
        is_active: boolean;
        created_at: string;
        updated_at: string;
        roles: Array<{ name: string }>;
        courier_profile?: {
            first_name: string;
            last_name: string;
            middle_name: string | null;
            phone: string;
            email: string;
            transport_type: string;
            transport_model: string | null;
            transport_number: string | null;
            transport_color: string | null;
            status: string;
            rating: number;
            total_deliveries: number;
            total_earnings: number;
        } | null;
        preferences?: {
            language: string;
            timezone: string;
            currency: string;
            theme: string;
            compact_mode: boolean;
            default_delivery_time: number;
            auto_confirm_orders: boolean;
            max_order_amount: string | null;
            show_phone: boolean;
            show_email: boolean;
            allow_marketing: boolean;
        } | null;
    };
}

export default function Show({ user }: ShowUserPageProps) {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const handleDelete = () => {
        router.delete(route('users.destroy', user.id), {
            onSuccess: () => {
                // Перенаправление происходит автоматически
            },
        });
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'Не указано';
        return new Date(dateString).toLocaleDateString('ru-RU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleString('ru-RU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getGenderText = (gender: string | null) => {
        switch (gender) {
            case 'male':
                return 'Мужской';
            case 'female':
                return 'Женский';
            default:
                return 'Не указано';
        }
    };

    const getTransportTypeText = (type: string) => {
        const types: { [key: string]: string } = {
            bicycle: 'Велосипед',
            scooter: 'Скутер',
            motorcycle: 'Мотоцикл',
            car: 'Автомобиль',
            walking: 'Пешком',
        };
        return types[type] || type;
    };

    const getLanguageText = (lang: string) => {
        const languages: { [key: string]: string } = {
            ru: 'Русский',
            en: 'English',
            de: 'Deutsch',
            fr: 'Français',
        };
        return languages[lang] || lang;
    };

    const getThemeText = (theme: string) => {
        const themes: { [key: string]: string } = {
            light: 'Светлая',
            dark: 'Темная',
            auto: 'Автоматически',
        };
        return themes[theme] || theme;
    };

    return (
        <AppLayout>
            <Head title={`Пользователь: ${user.name}`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={Users.index()}>
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Назад
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">
                                {user.name}
                            </h1>
                            <p className="text-muted-foreground">
                                Информация о пользователе
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link href={Users.edit(user.id)}>
                            <Button variant="outline" size="sm">
                                <Edit className="mr-2 h-4 w-4" />
                                Редактировать
                            </Button>
                        </Link>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setShowDeleteConfirm(true)}
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Удалить
                        </Button>
                    </div>
                </div>

                {/* Status Badge */}
                <div className="flex items-center gap-2">
                    {user.is_active ? (
                        <Badge
                            variant="default"
                            className="bg-green-100 text-green-800"
                        >
                            <UserCheck className="mr-1 h-3 w-3" />
                            Активный
                        </Badge>
                    ) : (
                        <Badge
                            variant="secondary"
                            className="bg-red-100 text-red-800"
                        >
                            <UserX className="mr-1 h-3 w-3" />
                            Неактивный
                        </Badge>
                    )}
                    {user.roles.map((role) => (
                        <Badge key={role.name} variant="outline">
                            {role.name}
                        </Badge>
                    ))}
                </div>

                <Tabs defaultValue="basic" className="space-y-6">
                    <TabsList>
                        <TabsTrigger value="basic">
                            <User className="mr-2 h-4 w-4" />
                            Основная информация
                        </TabsTrigger>
                        {user.courier_profile && (
                            <TabsTrigger value="courier">
                                <Truck className="mr-2 h-4 w-4" />
                                Профиль курьера
                            </TabsTrigger>
                        )}
                        <TabsTrigger value="preferences">
                            <Settings className="mr-2 h-4 w-4" />
                            Настройки
                        </TabsTrigger>
                    </TabsList>

                    {/* Basic Information */}
                    <TabsContent value="basic" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Основная информация</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <User className="h-5 w-5 text-muted-foreground" />
                                            <div>
                                                <p className="text-sm font-medium">
                                                    Имя
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {user.name}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <Mail className="h-5 w-5 text-muted-foreground" />
                                            <div>
                                                <p className="text-sm font-medium">
                                                    Email
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {user.email}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <Phone className="h-5 w-5 text-muted-foreground" />
                                            <div>
                                                <p className="text-sm font-medium">
                                                    Телефон
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {user.phone || 'Не указан'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <Calendar className="h-5 w-5 text-muted-foreground" />
                                            <div>
                                                <p className="text-sm font-medium">
                                                    Дата рождения
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {formatDate(
                                                        user.birth_date,
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-sm font-medium">
                                                Пол
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {getGenderText(user.gender)}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-sm font-medium">
                                                О себе
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {user.bio || 'Не указано'}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <MapPin className="h-5 w-5 text-muted-foreground" />
                                            <div>
                                                <p className="text-sm font-medium">
                                                    Адрес по умолчанию
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {user.default_address ||
                                                        'Не указан'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                <div className="space-y-4">
                                    <h4 className="text-lg font-medium">
                                        Настройки уведомлений
                                    </h4>
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                        <div className="flex items-center gap-2">
                                            <div
                                                className={`h-2 w-2 rounded-full ${
                                                    user.email_notifications
                                                        ? 'bg-green-500'
                                                        : 'bg-gray-300'
                                                }`}
                                            />
                                            <span className="text-sm">
                                                Email уведомления
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div
                                                className={`h-2 w-2 rounded-full ${
                                                    user.sms_notifications
                                                        ? 'bg-green-500'
                                                        : 'bg-gray-300'
                                                }`}
                                            />
                                            <span className="text-sm">
                                                SMS уведомления
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div
                                                className={`h-2 w-2 rounded-full ${
                                                    user.push_notifications
                                                        ? 'bg-green-500'
                                                        : 'bg-gray-300'
                                                }`}
                                            />
                                            <span className="text-sm">
                                                Push уведомления
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                <div className="space-y-4">
                                    <h4 className="text-lg font-medium">
                                        Системная информация
                                    </h4>
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div>
                                            <p className="text-sm font-medium">
                                                Дата создания
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {formatDateTime(
                                                    user.created_at,
                                                )}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">
                                                Последнее обновление
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {formatDateTime(
                                                    user.updated_at,
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Courier Profile */}
                    {user.courier_profile && (
                        <TabsContent value="courier" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Профиль курьера</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                        <div className="space-y-4">
                                            <div>
                                                <p className="text-sm font-medium">
                                                    Имя
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {
                                                        user.courier_profile
                                                            .first_name
                                                    }
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-sm font-medium">
                                                    Фамилия
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {
                                                        user.courier_profile
                                                            .last_name
                                                    }
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-sm font-medium">
                                                    Отчество
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {user.courier_profile
                                                        .middle_name ||
                                                        'Не указано'}
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <Phone className="h-5 w-5 text-muted-foreground" />
                                                <div>
                                                    <p className="text-sm font-medium">
                                                        Телефон
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {
                                                            user.courier_profile
                                                                .phone
                                                        }
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <Mail className="h-5 w-5 text-muted-foreground" />
                                                <div>
                                                    <p className="text-sm font-medium">
                                                        Email
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {
                                                            user.courier_profile
                                                                .email
                                                        }
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div>
                                                <p className="text-sm font-medium">
                                                    Тип транспорта
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {getTransportTypeText(
                                                        user.courier_profile
                                                            .transport_type,
                                                    )}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-sm font-medium">
                                                    Модель транспорта
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {user.courier_profile
                                                        .transport_model ||
                                                        'Не указана'}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-sm font-medium">
                                                    Номер транспорта
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {user.courier_profile
                                                        .transport_number ||
                                                        'Не указан'}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-sm font-medium">
                                                    Цвет транспорта
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {user.courier_profile
                                                        .transport_color ||
                                                        'Не указан'}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-sm font-medium">
                                                    Статус
                                                </p>
                                                <Badge
                                                    variant={
                                                        user.courier_profile
                                                            .status === 'active'
                                                            ? 'default'
                                                            : 'secondary'
                                                    }
                                                >
                                                    {user.courier_profile
                                                        .status === 'active'
                                                        ? 'Активный'
                                                        : 'Неактивный'}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>

                                    <Separator />

                                    <div className="space-y-4">
                                        <h4 className="text-lg font-medium">
                                            Статистика
                                        </h4>
                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                            <div className="text-center">
                                                <p className="text-2xl font-bold">
                                                    {user.courier_profile.rating.toFixed(
                                                        1,
                                                    )}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    Рейтинг
                                                </p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-2xl font-bold">
                                                    {
                                                        user.courier_profile
                                                            .total_deliveries
                                                    }
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    Доставок выполнено
                                                </p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-2xl font-bold">
                                                    {user.courier_profile.total_earnings.toLocaleString(
                                                        'ru-RU',
                                                    )}{' '}
                                                    ₽
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    Заработано
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    )}

                    {/* Preferences */}
                    <TabsContent value="preferences" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Настройки пользователя</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-sm font-medium">
                                                Язык
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {getLanguageText(
                                                    user.preferences
                                                        ?.language || 'ru',
                                                )}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-sm font-medium">
                                                Часовой пояс
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {user.preferences?.timezone ||
                                                    'Europe/Moscow'}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-sm font-medium">
                                                Валюта
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {user.preferences?.currency ||
                                                    'RUB'}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-sm font-medium">
                                                Тема
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {getThemeText(
                                                    user.preferences?.theme ||
                                                        'light',
                                                )}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-sm font-medium">
                                                Время доставки по умолчанию
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {user.preferences
                                                    ?.default_delivery_time ||
                                                    30}{' '}
                                                минут
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-sm font-medium">
                                                Максимальная сумма заказа
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {user.preferences
                                                    ?.max_order_amount
                                                    ? `${user.preferences.max_order_amount} ₽`
                                                    : 'Не ограничено'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                <div className="space-y-4">
                                    <h4 className="text-lg font-medium">
                                        Дополнительные настройки
                                    </h4>
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div className="flex items-center gap-2">
                                            <div
                                                className={`h-2 w-2 rounded-full ${
                                                    user.preferences
                                                        ?.compact_mode
                                                        ? 'bg-green-500'
                                                        : 'bg-gray-300'
                                                }`}
                                            />
                                            <span className="text-sm">
                                                Компактный режим
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div
                                                className={`h-2 w-2 rounded-full ${
                                                    user.preferences
                                                        ?.auto_confirm_orders
                                                        ? 'bg-green-500'
                                                        : 'bg-gray-300'
                                                }`}
                                            />
                                            <span className="text-sm">
                                                Автоподтверждение заказов
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div
                                                className={`h-2 w-2 rounded-full ${
                                                    user.preferences?.show_phone
                                                        ? 'bg-green-500'
                                                        : 'bg-gray-300'
                                                }`}
                                            />
                                            <span className="text-sm">
                                                Показывать телефон
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div
                                                className={`h-2 w-2 rounded-full ${
                                                    user.preferences?.show_email
                                                        ? 'bg-green-500'
                                                        : 'bg-gray-300'
                                                }`}
                                            />
                                            <span className="text-sm">
                                                Показывать email
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div
                                                className={`h-2 w-2 rounded-full ${
                                                    user.preferences
                                                        ?.allow_marketing
                                                        ? 'bg-green-500'
                                                        : 'bg-gray-300'
                                                }`}
                                            />
                                            <span className="text-sm">
                                                Разрешить маркетинг
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Delete Confirmation Modal */}
                {showDeleteConfirm && (
                    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
                        <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6">
                            <h3 className="mb-4 text-lg font-semibold">
                                Подтверждение удаления
                            </h3>
                            <p className="mb-6 text-sm text-muted-foreground">
                                Вы уверены, что хотите удалить пользователя "
                                {user.name}"? Это действие нельзя отменить.
                            </p>
                            <div className="flex justify-end gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowDeleteConfirm(false)}
                                >
                                    Отмена
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={handleDelete}
                                >
                                    Удалить
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
