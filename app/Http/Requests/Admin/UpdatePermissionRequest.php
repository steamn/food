<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePermissionRequest extends FormRequest
{
        /**
         * Determine if the user is authorized to make this request.
         */
        public function authorize(): bool
        {
                return $this->user()->can('update', $this->route('permission'));
        }

        /**
         * Get the validation rules that apply to the request.
         *
         * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
         */
        public function rules(): array
        {
                $permissionId = $this->route('permission')->id;

                return [
                        'name' => [
                                'required',
                                'string',
                                'max:255',
                                Rule::unique('permissions', 'name')->ignore($permissionId),
                        ],
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
                        'name.required' => 'Название разрешения обязательно для заполнения.',
                        'name.unique' => 'Разрешение с таким названием уже существует.',
                        'name.max' => 'Название разрешения не должно превышать 255 символов.',
                ];
        }
}
