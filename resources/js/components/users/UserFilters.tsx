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
import { Search, X } from 'lucide-react';
import { useState } from 'react';

interface UserFiltersProps {
    filters: {
        search?: string;
        role?: string;
        status?: string;
        sort_by?: string;
        sort_direction?: string;
    };
    roles: string[];
    onFilter: (key: string, value: string) => void;
    onSearch: (search: string) => void;
}

export function UserFilters({
    filters,
    roles,
    onFilter,
    onSearch,
}: UserFiltersProps) {
    const [searchValue, setSearchValue] = useState(filters.search || '');

    const handleSearch = (value: string) => {
        setSearchValue(value);
        onSearch(value);
    };

    const clearFilters = () => {
        setSearchValue('');
        onSearch('');
        onFilter('role', '');
        onFilter('status', '');
        onFilter('sort_by', '');
        onFilter('sort_direction', '');
    };

    const hasActiveFilters =
        filters.search || filters.role || filters.status || filters.sort_by;

    return (
        <Card>
            <CardContent className="pt-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {/* Search */}
                    <div className="space-y-2">
                        <Label htmlFor="search">Поиск</Label>
                        <div className="relative">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                            <Input
                                id="search"
                                placeholder="Поиск по имени, email, телефону..."
                                value={searchValue}
                                onChange={(e) => handleSearch(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>

                    {/* Role Filter */}
                    <div className="space-y-2">
                        <Label htmlFor="role">Роль</Label>
                        <Select
                            value={filters.role || ''}
                            onValueChange={(value) => onFilter('role', value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Все роли" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">Все роли</SelectItem>
                                {roles.map((role) => (
                                    <SelectItem key={role} value={role}>
                                        {role}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Status Filter */}
                    <div className="space-y-2">
                        <Label htmlFor="status">Статус</Label>
                        <Select
                            value={filters.status || ''}
                            onValueChange={(value) => onFilter('status', value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Все статусы" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">Все статусы</SelectItem>
                                <SelectItem value="active">Активные</SelectItem>
                                <SelectItem value="inactive">
                                    Неактивные
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Sort */}
                    <div className="space-y-2">
                        <Label htmlFor="sort">Сортировка</Label>
                        <Select
                            value={filters.sort_by || ''}
                            onValueChange={(value) =>
                                onFilter('sort_by', value)
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Сортировка" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">По умолчанию</SelectItem>
                                <SelectItem value="name">По имени</SelectItem>
                                <SelectItem value="email">По email</SelectItem>
                                <SelectItem value="created_at">
                                    По дате регистрации
                                </SelectItem>
                                <SelectItem value="last_login_at">
                                    По последнему входу
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Clear Filters */}
                {hasActiveFilters && (
                    <div className="mt-4 flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                            Активные фильтры:{' '}
                            {[
                                filters.search && 'Поиск',
                                filters.role && `Роль: ${filters.role}`,
                                filters.status && `Статус: ${filters.status}`,
                                filters.sort_by &&
                                    `Сортировка: ${filters.sort_by}`,
                            ]
                                .filter(Boolean)
                                .join(', ')}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={clearFilters}
                        >
                            <X className="mr-2 h-4 w-4" />
                            Очистить фильтры
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
