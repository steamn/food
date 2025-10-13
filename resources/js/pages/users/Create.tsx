import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { AppLayout } from '@/layouts/AppLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save, Settings, Truck, User } from 'lucide-react';
import { useState } from 'react';

interface CreateUserPageProps {
    roles: string[];
}

export default function Create({ roles }: CreateUserPageProps) {
    const [showCourierProfile, setShowCourierProfile] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        phone: '',
        avatar: null as File | null,
        bio: '',
        birth_date: '',
        gender: '',
        default_address: '',
        default_latitude: '',
        default_longitude: '',
        email_notifications: true,
        sms_notifications: true,
        push_notifications: true,
        is_active: true,
        roles: [] as string[],
        courier_profile: {
            first_name: '',
            last_name: '',
            middle_name: '',
            phone: '',
            email: '',
            transport_type: '',
            transport_model: '',
            transport_number: '',
            transport_color: '',
        },
        preferences: {
            language: 'ru',
            timezone: 'Europe/Moscow',
            currency: 'RUB',
            theme: 'light',
            compact_mode: false,
            default_delivery_time: 30,
            auto_confirm_orders: false,
            max_order_amount: '',
            show_phone: false,
            show_email: false,
            allow_marketing: true,
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const formData = new FormData();
        Object.keys(data).forEach((key) => {
            if (key === 'avatar' && data.avatar) {
                formData.append(key, data.avatar);
            } else if (key === 'courier_profile' || key === 'preferences') {
                formData.append(key, JSON.stringify(data[key]));
            } else if (key === 'roles') {
                data.roles.forEach((role: string) =>
                    formData.append('roles[]', role),
                );
            } else if (data[key] !== null && data[key] !== '') {
                formData.append(key, data[key]);
            }
        });

        post(route('users.store'), {
            forceFormData: true,
            onSuccess: () => {
                reset();
            },
        });
    };

    const handleRoleChange = (role: string, checked: boolean) => {
        if (checked) {
            setData('roles', [...data.roles, role]);
            if (role === 'courier') {
                setShowCourierProfile(true);
            }
        } else {
            setData(
                'roles',
                data.roles.filter((r) => r !== role),
            );
            if (role === 'courier') {
                setShowCourierProfile(false);
            }
        }
    };

    return (
        <AppLayout>
            <Head title="Создать пользователя" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href={route('users.index')}>
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Назад
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Создать пользователя
                        </h1>
                        <p className="text-muted-foreground">
                            Добавить нового пользователя в систему
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Tabs defaultValue="basic" className="space-y-6">
                        <TabsList>
                            <TabsTrigger value="basic">
                                <User className="mr-2 h-4 w-4" />
                                Основная информация
                            </TabsTrigger>
                            <TabsTrigger
                                value="courier"
                                disabled={!showCourierProfile}
                            >
                                <Truck className="mr-2 h-4 w-4" />
                                Профиль курьера
                            </TabsTrigger>
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
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Имя *</Label>
                                            <Input
                                                id="name"
                                                value={data.name}
                                                onChange={(e) =>
                                                    setData(
                                                        'name',
                                                        e.target.value,
                                                    )
                                                }
                                                className={
                                                    errors.name
                                                        ? 'border-red-500'
                                                        : ''
                                                }
                                            />
                                            {errors.name && (
                                                <p className="text-sm text-red-500">
                                                    {errors.name}
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="email">
                                                Email *
                                            </Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={data.email}
                                                onChange={(e) =>
                                                    setData(
                                                        'email',
                                                        e.target.value,
                                                    )
                                                }
                                                className={
                                                    errors.email
                                                        ? 'border-red-500'
                                                        : ''
                                                }
                                            />
                                            {errors.email && (
                                                <p className="text-sm text-red-500">
                                                    {errors.email}
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="password">
                                                Пароль *
                                            </Label>
                                            <Input
                                                id="password"
                                                type="password"
                                                value={data.password}
                                                onChange={(e) =>
                                                    setData(
                                                        'password',
                                                        e.target.value,
                                                    )
                                                }
                                                className={
                                                    errors.password
                                                        ? 'border-red-500'
                                                        : ''
                                                }
                                            />
                                            {errors.password && (
                                                <p className="text-sm text-red-500">
                                                    {errors.password}
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="password_confirmation">
                                                Подтверждение пароля *
                                            </Label>
                                            <Input
                                                id="password_confirmation"
                                                type="password"
                                                value={
                                                    data.password_confirmation
                                                }
                                                onChange={(e) =>
                                                    setData(
                                                        'password_confirmation',
                                                        e.target.value,
                                                    )
                                                }
                                                className={
                                                    errors.password_confirmation
                                                        ? 'border-red-500'
                                                        : ''
                                                }
                                            />
                                            {errors.password_confirmation && (
                                                <p className="text-sm text-red-500">
                                                    {
                                                        errors.password_confirmation
                                                    }
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="phone">
                                                Телефон
                                            </Label>
                                            <Input
                                                id="phone"
                                                value={data.phone}
                                                onChange={(e) =>
                                                    setData(
                                                        'phone',
                                                        e.target.value,
                                                    )
                                                }
                                                className={
                                                    errors.phone
                                                        ? 'border-red-500'
                                                        : ''
                                                }
                                            />
                                            {errors.phone && (
                                                <p className="text-sm text-red-500">
                                                    {errors.phone}
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="gender">Пол</Label>
                                            <Select
                                                value={data.gender}
                                                onValueChange={(value) =>
                                                    setData('gender', value)
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Выберите пол" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="male">
                                                        Мужской
                                                    </SelectItem>
                                                    <SelectItem value="female">
                                                        Женский
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="bio">О себе</Label>
                                        <Textarea
                                            id="bio"
                                            value={data.bio}
                                            onChange={(e) =>
                                                setData('bio', e.target.value)
                                            }
                                            rows={3}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="birth_date">
                                            Дата рождения
                                        </Label>
                                        <Input
                                            id="birth_date"
                                            type="date"
                                            value={data.birth_date}
                                            onChange={(e) =>
                                                setData(
                                                    'birth_date',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </div>

                                    <div className="space-y-4">
                                        <Label>Роли</Label>
                                        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                                            {roles.map((role) => (
                                                <div
                                                    key={role}
                                                    className="flex items-center space-x-2"
                                                >
                                                    <Checkbox
                                                        id={`role-${role}`}
                                                        checked={data.roles.includes(
                                                            role,
                                                        )}
                                                        onCheckedChange={(
                                                            checked,
                                                        ) =>
                                                            handleRoleChange(
                                                                role,
                                                                checked as boolean,
                                                            )
                                                        }
                                                    />
                                                    <Label
                                                        htmlFor={`role-${role}`}
                                                        className="text-sm"
                                                    >
                                                        {role}
                                                    </Label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <Label>Настройки уведомлений</Label>
                                        <div className="space-y-2">
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="email_notifications"
                                                    checked={
                                                        data.email_notifications
                                                    }
                                                    onCheckedChange={(
                                                        checked,
                                                    ) =>
                                                        setData(
                                                            'email_notifications',
                                                            checked as boolean,
                                                        )
                                                    }
                                                />
                                                <Label htmlFor="email_notifications">
                                                    Email уведомления
                                                </Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="sms_notifications"
                                                    checked={
                                                        data.sms_notifications
                                                    }
                                                    onCheckedChange={(
                                                        checked,
                                                    ) =>
                                                        setData(
                                                            'sms_notifications',
                                                            checked as boolean,
                                                        )
                                                    }
                                                />
                                                <Label htmlFor="sms_notifications">
                                                    SMS уведомления
                                                </Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="push_notifications"
                                                    checked={
                                                        data.push_notifications
                                                    }
                                                    onCheckedChange={(
                                                        checked,
                                                    ) =>
                                                        setData(
                                                            'push_notifications',
                                                            checked as boolean,
                                                        )
                                                    }
                                                />
                                                <Label htmlFor="push_notifications">
                                                    Push уведомления
                                                </Label>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="is_active"
                                            checked={data.is_active}
                                            onCheckedChange={(checked) =>
                                                setData(
                                                    'is_active',
                                                    checked as boolean,
                                                )
                                            }
                                        />
                                        <Label htmlFor="is_active">
                                            Активный пользователь
                                        </Label>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Courier Profile */}
                        {showCourierProfile && (
                            <TabsContent value="courier" className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Профиль курьера</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label htmlFor="courier_first_name">
                                                    Имя *
                                                </Label>
                                                <Input
                                                    id="courier_first_name"
                                                    value={
                                                        data.courier_profile
                                                            .first_name
                                                    }
                                                    onChange={(e) =>
                                                        setData(
                                                            'courier_profile',
                                                            {
                                                                ...data.courier_profile,
                                                                first_name:
                                                                    e.target
                                                                        .value,
                                                            },
                                                        )
                                                    }
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="courier_last_name">
                                                    Фамилия *
                                                </Label>
                                                <Input
                                                    id="courier_last_name"
                                                    value={
                                                        data.courier_profile
                                                            .last_name
                                                    }
                                                    onChange={(e) =>
                                                        setData(
                                                            'courier_profile',
                                                            {
                                                                ...data.courier_profile,
                                                                last_name:
                                                                    e.target
                                                                        .value,
                                                            },
                                                        )
                                                    }
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="courier_middle_name">
                                                    Отчество
                                                </Label>
                                                <Input
                                                    id="courier_middle_name"
                                                    value={
                                                        data.courier_profile
                                                            .middle_name
                                                    }
                                                    onChange={(e) =>
                                                        setData(
                                                            'courier_profile',
                                                            {
                                                                ...data.courier_profile,
                                                                middle_name:
                                                                    e.target
                                                                        .value,
                                                            },
                                                        )
                                                    }
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="courier_phone">
                                                    Телефон *
                                                </Label>
                                                <Input
                                                    id="courier_phone"
                                                    value={
                                                        data.courier_profile
                                                            .phone
                                                    }
                                                    onChange={(e) =>
                                                        setData(
                                                            'courier_profile',
                                                            {
                                                                ...data.courier_profile,
                                                                phone: e.target
                                                                    .value,
                                                            },
                                                        )
                                                    }
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="courier_email">
                                                    Email *
                                                </Label>
                                                <Input
                                                    id="courier_email"
                                                    type="email"
                                                    value={
                                                        data.courier_profile
                                                            .email
                                                    }
                                                    onChange={(e) =>
                                                        setData(
                                                            'courier_profile',
                                                            {
                                                                ...data.courier_profile,
                                                                email: e.target
                                                                    .value,
                                                            },
                                                        )
                                                    }
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="transport_type">
                                                    Тип транспорта *
                                                </Label>
                                                <Select
                                                    value={
                                                        data.courier_profile
                                                            .transport_type
                                                    }
                                                    onValueChange={(value) =>
                                                        setData(
                                                            'courier_profile',
                                                            {
                                                                ...data.courier_profile,
                                                                transport_type:
                                                                    value,
                                                            },
                                                        )
                                                    }
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Выберите тип транспорта" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="bicycle">
                                                            Велосипед
                                                        </SelectItem>
                                                        <SelectItem value="scooter">
                                                            Скутер
                                                        </SelectItem>
                                                        <SelectItem value="motorcycle">
                                                            Мотоцикл
                                                        </SelectItem>
                                                        <SelectItem value="car">
                                                            Автомобиль
                                                        </SelectItem>
                                                        <SelectItem value="walking">
                                                            Пешком
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="transport_model">
                                                    Модель транспорта
                                                </Label>
                                                <Input
                                                    id="transport_model"
                                                    value={
                                                        data.courier_profile
                                                            .transport_model
                                                    }
                                                    onChange={(e) =>
                                                        setData(
                                                            'courier_profile',
                                                            {
                                                                ...data.courier_profile,
                                                                transport_model:
                                                                    e.target
                                                                        .value,
                                                            },
                                                        )
                                                    }
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="transport_number">
                                                    Номер транспорта
                                                </Label>
                                                <Input
                                                    id="transport_number"
                                                    value={
                                                        data.courier_profile
                                                            .transport_number
                                                    }
                                                    onChange={(e) =>
                                                        setData(
                                                            'courier_profile',
                                                            {
                                                                ...data.courier_profile,
                                                                transport_number:
                                                                    e.target
                                                                        .value,
                                                            },
                                                        )
                                                    }
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="transport_color">
                                                    Цвет транспорта
                                                </Label>
                                                <Input
                                                    id="transport_color"
                                                    value={
                                                        data.courier_profile
                                                            .transport_color
                                                    }
                                                    onChange={(e) =>
                                                        setData(
                                                            'courier_profile',
                                                            {
                                                                ...data.courier_profile,
                                                                transport_color:
                                                                    e.target
                                                                        .value,
                                                            },
                                                        )
                                                    }
                                                />
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
                                    <CardTitle>
                                        Настройки пользователя
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="language">
                                                Язык
                                            </Label>
                                            <Select
                                                value={
                                                    data.preferences.language
                                                }
                                                onValueChange={(value) =>
                                                    setData('preferences', {
                                                        ...data.preferences,
                                                        language: value,
                                                    })
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="ru">
                                                        Русский
                                                    </SelectItem>
                                                    <SelectItem value="en">
                                                        English
                                                    </SelectItem>
                                                    <SelectItem value="de">
                                                        Deutsch
                                                    </SelectItem>
                                                    <SelectItem value="fr">
                                                        Français
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="timezone">
                                                Часовой пояс
                                            </Label>
                                            <Input
                                                id="timezone"
                                                value={
                                                    data.preferences.timezone
                                                }
                                                onChange={(e) =>
                                                    setData('preferences', {
                                                        ...data.preferences,
                                                        timezone:
                                                            e.target.value,
                                                    })
                                                }
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="currency">
                                                Валюта
                                            </Label>
                                            <Select
                                                value={
                                                    data.preferences.currency
                                                }
                                                onValueChange={(value) =>
                                                    setData('preferences', {
                                                        ...data.preferences,
                                                        currency: value,
                                                    })
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="RUB">
                                                        RUB
                                                    </SelectItem>
                                                    <SelectItem value="USD">
                                                        USD
                                                    </SelectItem>
                                                    <SelectItem value="EUR">
                                                        EUR
                                                    </SelectItem>
                                                    <SelectItem value="GBP">
                                                        GBP
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="theme">Тема</Label>
                                            <Select
                                                value={data.preferences.theme}
                                                onValueChange={(value) =>
                                                    setData('preferences', {
                                                        ...data.preferences,
                                                        theme: value,
                                                    })
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="light">
                                                        Светлая
                                                    </SelectItem>
                                                    <SelectItem value="dark">
                                                        Темная
                                                    </SelectItem>
                                                    <SelectItem value="auto">
                                                        Автоматически
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="default_delivery_time">
                                                Время доставки по умолчанию
                                                (мин)
                                            </Label>
                                            <Input
                                                id="default_delivery_time"
                                                type="number"
                                                value={
                                                    data.preferences
                                                        .default_delivery_time
                                                }
                                                onChange={(e) =>
                                                    setData('preferences', {
                                                        ...data.preferences,
                                                        default_delivery_time:
                                                            parseInt(
                                                                e.target.value,
                                                            ) || 30,
                                                    })
                                                }
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="max_order_amount">
                                                Максимальная сумма заказа
                                            </Label>
                                            <Input
                                                id="max_order_amount"
                                                type="number"
                                                value={
                                                    data.preferences
                                                        .max_order_amount
                                                }
                                                onChange={(e) =>
                                                    setData('preferences', {
                                                        ...data.preferences,
                                                        max_order_amount:
                                                            e.target.value,
                                                    })
                                                }
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <Label>Дополнительные настройки</Label>
                                        <div className="space-y-2">
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="compact_mode"
                                                    checked={
                                                        data.preferences
                                                            .compact_mode
                                                    }
                                                    onCheckedChange={(
                                                        checked,
                                                    ) =>
                                                        setData('preferences', {
                                                            ...data.preferences,
                                                            compact_mode:
                                                                checked as boolean,
                                                        })
                                                    }
                                                />
                                                <Label htmlFor="compact_mode">
                                                    Компактный режим
                                                </Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="auto_confirm_orders"
                                                    checked={
                                                        data.preferences
                                                            .auto_confirm_orders
                                                    }
                                                    onCheckedChange={(
                                                        checked,
                                                    ) =>
                                                        setData('preferences', {
                                                            ...data.preferences,
                                                            auto_confirm_orders:
                                                                checked as boolean,
                                                        })
                                                    }
                                                />
                                                <Label htmlFor="auto_confirm_orders">
                                                    Автоподтверждение заказов
                                                </Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="show_phone"
                                                    checked={
                                                        data.preferences
                                                            .show_phone
                                                    }
                                                    onCheckedChange={(
                                                        checked,
                                                    ) =>
                                                        setData('preferences', {
                                                            ...data.preferences,
                                                            show_phone:
                                                                checked as boolean,
                                                        })
                                                    }
                                                />
                                                <Label htmlFor="show_phone">
                                                    Показывать телефон
                                                </Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="show_email"
                                                    checked={
                                                        data.preferences
                                                            .show_email
                                                    }
                                                    onCheckedChange={(
                                                        checked,
                                                    ) =>
                                                        setData('preferences', {
                                                            ...data.preferences,
                                                            show_email:
                                                                checked as boolean,
                                                        })
                                                    }
                                                />
                                                <Label htmlFor="show_email">
                                                    Показывать email
                                                </Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="allow_marketing"
                                                    checked={
                                                        data.preferences
                                                            .allow_marketing
                                                    }
                                                    onCheckedChange={(
                                                        checked,
                                                    ) =>
                                                        setData('preferences', {
                                                            ...data.preferences,
                                                            allow_marketing:
                                                                checked as boolean,
                                                        })
                                                    }
                                                />
                                                <Label htmlFor="allow_marketing">
                                                    Разрешить маркетинг
                                                </Label>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-4">
                        <Link href={route('users.index')}>
                            <Button variant="outline" type="button">
                                Отмена
                            </Button>
                        </Link>
                        <Button type="submit" disabled={processing}>
                            <Save className="mr-2 h-4 w-4" />
                            {processing
                                ? 'Создание...'
                                : 'Создать пользователя'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
