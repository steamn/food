<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreRoleRequest extends FormRequest
{
        /**
         * Determine if the user is authorized to make this request.
         */
        public function authorize(): bool
        {
                return $this->user()->can('create', \Spatie\Permission\Models\Role::class);
        }

        /**
         * Get the validation rules that apply to the request.
         *
         * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
         */
        public function rules(): array
        {
                return [
                        'name' => [
                                'required',
                                'string',
                                'max:255',
                                'unique:roles,name',
                        ],
                        'permissions' => 'array',
                        'permissions.*' => 'string|exists:permissions,name',
                ];
        }

        /**
         * Get custom messages for validator errors.
         *
         * @return array<string, string>
         */
        public function messages(): array
        {
                return [
                        'name.required' => 'Название роли обязательно для заполнения.',
                        'name.unique' => 'Роль с таким названием уже существует.',
                        'name.max' => 'Название роли не должно превышать 255 символов.',
                        'permissions.array' => 'Разрешения должны быть массивом.',
                        'permissions.*.exists' => 'Одно или несколько разрешений не существуют.',
                ];
        }
}
