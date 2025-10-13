<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RoleResource extends JsonResource
{
        /**
         * Transform the resource into an array.
         *
         * @return array<string, mixed>
         */
        public function toArray(Request $request): array
        {
                return [
                        'id' => $this->id,
                        'name' => $this->name,
                        'guard_name' => $this->guard_name,
                        'created_at' => $this->created_at->format('Y-m-d H:i:s'),
                        'updated_at' => $this->updated_at->format('Y-m-d H:i:s'),
                        'permissions' => $this->whenLoaded('permissions', function () {
                                return $this->permissions->map(function ($permission) {
                                        return [
                                                'id' => $permission->id,
                                                'name' => $permission->name,
                                        ];
                                });
                        }),
                        'users_count' => $this->whenLoaded('users', function () {
                                return $this->users->count();
                        }),
                        'permissions_count' => $this->whenLoaded('permissions', function () {
                                return $this->permissions->count();
                        }),
                ];
        }
}
