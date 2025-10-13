<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PermissionResource extends JsonResource
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
                        'group' => explode(' ', $this->name)[0],
                        'roles' => $this->whenLoaded('roles', function () {
                                return $this->roles->map(function ($role) {
                                        return [
                                                'id' => $role->id,
                                                'name' => $role->name,
                                        ];
                                });
                        }, []),
                        'roles_count' => $this->whenLoaded('roles', function () {
                                return $this->roles->count();
                        }, 0),
                ];
        }
}
