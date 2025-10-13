<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class BulkActionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->can('viewAny', \App\Models\User::class);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'action' => 'required|string|in:activate,deactivate,delete',
            'user_ids' => 'required|array|min:1',
            'user_ids.*' => 'integer|exists:users,id',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'action.required' => 'Действие обязательно для выбора.',
            'action.in' => 'Неверное действие. Доступные: активировать, деактивировать, удалить.',
            'user_ids.required' => 'Необходимо выбрать пользователей.',
            'user_ids.array' => 'Пользователи должны быть переданы в виде массива.',
            'user_ids.min' => 'Необходимо выбрать хотя бы одного пользователя.',
            'user_ids.*.integer' => 'ID пользователя должен быть числом.',
            'user_ids.*.exists' => 'Один или несколько выбранных пользователей не существуют.',
        ];
    }
}
