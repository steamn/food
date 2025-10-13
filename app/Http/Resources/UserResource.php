<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
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
            'email' => $this->email,
            'phone' => $this->phone,
            'avatar' => $this->avatar,
            'avatar_url' => $this->avatar_url,
            'bio' => $this->bio,
            'birth_date' => $this->birth_date?->format('Y-m-d'),
            'gender' => $this->gender,
            'default_address' => $this->default_address,
            'default_latitude' => $this->default_latitude,
            'default_longitude' => $this->default_longitude,
            'email_notifications' => $this->email_notifications,
            'sms_notifications' => $this->sms_notifications,
            'push_notifications' => $this->push_notifications,
            'is_active' => $this->is_active,
            'last_login_at' => $this->last_login_at?->format('Y-m-d H:i:s'),
            'last_login_ip' => $this->last_login_ip,
            'created_at' => $this->created_at->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at->format('Y-m-d H:i:s'),

            // Relationships
            'roles' => $this->whenLoaded('roles', function () {
                return $this->roles->pluck('name');
            }),
            'courier_profile' => $this->whenLoaded('courierProfile', function () {
                return [
                    'id' => $this->courierProfile->id,
                    'first_name' => $this->courierProfile->first_name,
                    'last_name' => $this->courierProfile->last_name,
                    'middle_name' => $this->courierProfile->middle_name,
                    'full_name' => $this->courierProfile->full_name,
                    'phone' => $this->courierProfile->phone,
                    'email' => $this->courierProfile->email,
                    'transport_type' => $this->courierProfile->transport_type,
                    'transport_model' => $this->courierProfile->transport_model,
                    'transport_number' => $this->courierProfile->transport_number,
                    'transport_color' => $this->courierProfile->transport_color,
                    'status' => $this->courierProfile->status,
                    'rating' => $this->courierProfile->rating,
                    'total_deliveries' => $this->courierProfile->total_deliveries,
                    'total_earnings' => $this->courierProfile->total_earnings,
                    'delivery_zones' => $this->courierProfile->delivery_zones,
                    'work_schedule' => $this->courierProfile->work_schedule,
                    'bank_name' => $this->courierProfile->bank_name,
                    'bank_account' => $this->courierProfile->bank_account,
                    'bank_card_number' => $this->courierProfile->bank_card_number,
                    'notes' => $this->courierProfile->notes,
                    'documents' => $this->courierProfile->documents,
                    'created_at' => $this->courierProfile->created_at->format('Y-m-d H:i:s'),
                    'updated_at' => $this->courierProfile->updated_at->format('Y-m-d H:i:s'),
                ];
            }),
            'preferences' => $this->whenLoaded('preferences', function () {
                return [
                    'id' => $this->preferences->id,
                    'language' => $this->preferences->language,
                    'timezone' => $this->preferences->timezone,
                    'currency' => $this->preferences->currency,
                    'theme' => $this->preferences->theme,
                    'compact_mode' => $this->preferences->compact_mode,
                    'dashboard_widgets' => $this->preferences->dashboard_widgets,
                    'notification_settings' => $this->preferences->notification_settings,
                    'quiet_hours_start' => $this->preferences->quiet_hours_start?->format('H:i'),
                    'quiet_hours_end' => $this->preferences->quiet_hours_end?->format('H:i'),
                    'default_delivery_time' => $this->preferences->default_delivery_time,
                    'auto_confirm_orders' => $this->preferences->auto_confirm_orders,
                    'max_order_amount' => $this->preferences->max_order_amount,
                    'show_phone' => $this->preferences->show_phone,
                    'show_email' => $this->preferences->show_email,
                    'allow_marketing' => $this->preferences->allow_marketing,
                    'created_at' => $this->preferences->created_at->format('Y-m-d H:i:s'),
                    'updated_at' => $this->preferences->updated_at->format('Y-m-d H:i:s'),
                ];
            }),
            'addresses' => $this->whenLoaded('addresses', function () {
                return $this->addresses->map(function ($address) {
                    return [
                        'id' => $address->id,
                        'name' => $address->name,
                        'address' => $address->address,
                        'latitude' => $address->latitude,
                        'longitude' => $address->longitude,
                        'is_default' => $address->is_default,
                        'created_at' => $address->created_at->format('Y-m-d H:i:s'),
                    ];
                });
            }),
            'orders' => $this->whenLoaded('orders', function () {
                return $this->orders->map(function ($order) {
                    return [
                        'id' => $order->id,
                        'status' => $order->status,
                        'total_amount' => $order->total_amount,
                        'created_at' => $order->created_at->format('Y-m-d H:i:s'),
                    ];
                });
            }),

            // Computed attributes
            'is_courier' => $this->is_courier,
            'is_admin' => $this->is_admin,
            'full_name' => $this->full_name,
        ];
    }
}
