<?php

namespace App\Http\Controllers;

use App\Http\Requests\BulkActionRequest;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Http\Resources\UserCollection;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = User::with(['roles', 'courierProfile', 'preferences'])
            ->when($request->search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%");
                });
            })
            ->when($request->role, function ($query, $role) {
                $query->whereHas('roles', function ($q) use ($role) {
                    $q->where('name', $role);
                });
            })
            ->when($request->status, function ($query, $status) {
                if ($status === 'active') {
                    $query->where('is_active', true);
                } elseif ($status === 'inactive') {
                    $query->where('is_active', false);
                }
            })
            ->when($request->sort_by, function ($query, $sortBy) use ($request) {
                $direction = $request->sort_direction ?? 'asc';
                $query->orderBy($sortBy, $direction);
            }, function ($query) {
                $query->latest();
            });

        $users = $query->paginate(15)->withQueryString();

        return Inertia::render('users/Index', [
            'users' => new UserCollection($users),
            'filters' => $request->only(['search', 'role', 'status', 'sort_by', 'sort_direction']),
            'roles' => Role::all()->pluck('name'),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('users/Create', [
            'roles' => Role::all()->pluck('name'),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreUserRequest $request)
    {
        $user = User::create($request->validated());

        if ($request->has('roles')) {
            $user->assignRole($request->roles);
        }

        if ($request->has('courier_profile') && $request->roles && in_array('courier', $request->roles)) {
            $user->courierProfile()->create($request->courier_profile);
        }

        if ($request->has('preferences')) {
            $user->preferences()->create($request->preferences);
        }

        return redirect()->route('users.index')
            ->with('success', 'Пользователь успешно создан.');
    }

    /**
     * Display the specified resource.
     */
    public function show(User $user)
    {
        $user->load(['roles', 'courierProfile', 'preferences']);

        return Inertia::render('users/Show', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'avatar' => $user->avatar,
                'bio' => $user->bio,
                'birth_date' => $user->birth_date?->format('Y-m-d'),
                'gender' => $user->gender,
                'default_address' => $user->default_address,
                'default_latitude' => $user->default_latitude,
                'default_longitude' => $user->default_longitude,
                'email_notifications' => $user->email_notifications,
                'sms_notifications' => $user->sms_notifications,
                'push_notifications' => $user->push_notifications,
                'is_active' => $user->is_active,
                'created_at' => $user->created_at->format('Y-m-d H:i:s'),
                'updated_at' => $user->updated_at->format('Y-m-d H:i:s'),
                'roles' => $user->roles->map(fn($role) => ['name' => $role->name]),
                'courier_profile' => $user->courierProfile ? [
                    'first_name' => $user->courierProfile->first_name,
                    'last_name' => $user->courierProfile->last_name,
                    'middle_name' => $user->courierProfile->middle_name,
                    'phone' => $user->courierProfile->phone,
                    'email' => $user->courierProfile->email,
                    'transport_type' => $user->courierProfile->transport_type,
                    'transport_model' => $user->courierProfile->transport_model,
                    'transport_number' => $user->courierProfile->transport_number,
                    'transport_color' => $user->courierProfile->transport_color,
                    'status' => $user->courierProfile->status,
                    'rating' => $user->courierProfile->rating,
                    'total_deliveries' => $user->courierProfile->total_deliveries,
                    'total_earnings' => $user->courierProfile->total_earnings,
                ] : null,
                'preferences' => $user->preferences ? [
                    'language' => $user->preferences->language,
                    'timezone' => $user->preferences->timezone,
                    'currency' => $user->preferences->currency,
                    'theme' => $user->preferences->theme,
                    'compact_mode' => $user->preferences->compact_mode,
                    'default_delivery_time' => $user->preferences->default_delivery_time,
                    'auto_confirm_orders' => $user->preferences->auto_confirm_orders,
                    'max_order_amount' => $user->preferences->max_order_amount,
                    'show_phone' => $user->preferences->show_phone,
                    'show_email' => $user->preferences->show_email,
                    'allow_marketing' => $user->preferences->allow_marketing,
                ] : null,
            ],
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(User $user)
    {
        $user->load(['roles', 'courierProfile', 'preferences']);

        return Inertia::render('users/Edit', [
            'user' => new UserResource($user),
            'roles' => Role::all()->pluck('name'),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateUserRequest $request, User $user)
    {
        $user->update($request->validated());

        if ($request->has('roles')) {
            $user->syncRoles($request->roles);
        }

        if ($request->has('courier_profile')) {
            if ($user->courierProfile) {
                $user->courierProfile->update($request->courier_profile);
            } elseif (in_array('courier', $request->roles ?? [])) {
                $user->courierProfile()->create($request->courier_profile);
            }
        }

        if ($request->has('preferences')) {
            if ($user->preferences) {
                $user->preferences->update($request->preferences);
            } else {
                $user->preferences()->create($request->preferences);
            }
        }

        return redirect()->route('users.index')
            ->with('success', 'Пользователь успешно обновлен.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(User $user)
    {
        $user->delete();

        return redirect()->route('users.index')
            ->with('success', 'Пользователь успешно удален.');
    }

    /**
     * Handle bulk actions on users.
     */
    public function bulkAction(BulkActionRequest $request)
    {
        $action = $request->action;
        $userIds = $request->user_ids;

        switch ($action) {
            case 'activate':
                User::whereIn('id', $userIds)->update(['is_active' => true]);
                $message = 'Пользователи активированы.';
                break;

            case 'deactivate':
                User::whereIn('id', $userIds)->update(['is_active' => false]);
                $message = 'Пользователи деактивированы.';
                break;

            case 'delete':
                User::whereIn('id', $userIds)->delete();
                $message = 'Пользователи удалены.';
                break;

            default:
                return back()->with('error', 'Неизвестное действие.');
        }

        return back()->with('success', $message);
    }
}
