<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUserRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->can('update', $this->route('user'));
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $userId = $this->route('user')->id;

        return [
            'name' => 'sometimes|required|string|max:255',
            'email' => [
                'sometimes',
                'required',
                'email',
                Rule::unique('users', 'email')->ignore($userId),
            ],
            'password' => 'sometimes|nullable|string|min:8|confirmed',
            'phone' => [
                'sometimes',
                'nullable',
                'string',
                Rule::unique('users', 'phone')->ignore($userId),
            ],
            'avatar' => 'sometimes|nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'bio' => 'sometimes|nullable|string|max:1000',
            'birth_date' => 'sometimes|nullable|date|before:today',
            'gender' => 'sometimes|nullable|in:male,female',
            'default_address' => 'sometimes|nullable|string|max:500',
            'default_latitude' => 'sometimes|nullable|numeric|between:-90,90',
            'default_longitude' => 'sometimes|nullable|numeric|between:-180,180',
            'email_notifications' => 'sometimes|boolean',
            'sms_notifications' => 'sometimes|boolean',
            'push_notifications' => 'sometimes|boolean',
            'is_active' => 'sometimes|boolean',
            'roles' => 'sometimes|array',
            'roles.*' => 'string|exists:roles,name',
            'courier_profile' => 'sometimes|nullable|array',
            'courier_profile.first_name' => 'required_with:courier_profile|string|max:255',
            'courier_profile.last_name' => 'required_with:courier_profile|string|max:255',
            'courier_profile.middle_name' => 'nullable|string|max:255',
            'courier_profile.phone' => [
                'required_with:courier_profile',
                'string',
                Rule::unique('courier_profiles', 'phone')->ignore($this->route('user')->courierProfile?->id),
            ],
            'courier_profile.email' => [
                'required_with:courier_profile',
                'email',
                Rule::unique('courier_profiles', 'email')->ignore($this->route('user')->courierProfile?->id),
            ],
            'courier_profile.transport_type' => 'required_with:courier_profile|in:bicycle,scooter,motorcycle,car,walking',
            'courier_profile.transport_model' => 'nullable|string|max:255',
            'courier_profile.transport_number' => 'nullable|string|max:50',
            'courier_profile.transport_color' => 'nullable|string|max:50',
            'preferences' => 'sometimes|nullable|array',
            'preferences.language' => 'nullable|string|in:ru,en,de,fr',
            'preferences.timezone' => 'nullable|string|max:50',
            'preferences.currency' => 'nullable|string|size:3',
            'preferences.theme' => 'nullable|in:light,dark,auto',
            'preferences.compact_mode' => 'boolean',
            'preferences.default_delivery_time' => 'nullable|integer|min:5|max:300',
            'preferences.auto_confirm_orders' => 'boolean',
            'preferences.max_order_amount' => 'nullable|numeric|min:0',
            'preferences.show_phone' => 'boolean',
            'preferences.show_email' => 'boolean',
            'preferences.allow_marketing' => 'boolean',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Имя обязательно для заполнения.',
            'email.required' => 'Email обязателен для заполнения.',
            'email.unique' => 'Пользователь с таким email уже существует.',
            'password.min' => 'Пароль должен содержать минимум 8 символов.',
            'password.confirmed' => 'Пароли не совпадают.',
            'phone.unique' => 'Пользователь с таким телефоном уже существует.',
            'avatar.image' => 'Аватар должен быть изображением.',
            'avatar.mimes' => 'Аватар должен быть в формате JPEG, PNG, JPG или GIF.',
            'avatar.max' => 'Размер аватара не должен превышать 2MB.',
            'birth_date.before' => 'Дата рождения должна быть в прошлом.',
            'gender.in' => 'Пол должен быть мужской или женский.',
            'default_latitude.between' => 'Широта должна быть между -90 и 90.',
            'default_longitude.between' => 'Долгота должна быть между -180 и 180.',
            'courier_profile.phone.unique' => 'Курьер с таким телефоном уже существует.',
            'courier_profile.email.unique' => 'Курьер с таким email уже существует.',
            'courier_profile.transport_type.in' => 'Неверный тип транспорта.',
            'preferences.language.in' => 'Неподдерживаемый язык.',
            'preferences.theme.in' => 'Неподдерживаемая тема.',
            'preferences.default_delivery_time.min' => 'Время доставки должно быть не менее 5 минут.',
            'preferences.default_delivery_time.max' => 'Время доставки должно быть не более 300 минут.',
            'preferences.max_order_amount.min' => 'Максимальная сумма заказа не может быть отрицательной.',
        ];
    }
}
