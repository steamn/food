<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreRoleRequest;
use App\Http\Requests\Admin\UpdateRoleRequest;
use App\Http\Resources\RoleResource;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RoleController extends Controller
{
        /**
         * Display a listing of the resource.
         */
        public function index(Request $request)
        {
                $query = Role::with('permissions');

                // Search
                if ($request->filled('search')) {
                        $search = $request->get('search');
                        $query->where('name', 'like', "%{$search}%");
                }

                // Sort
                $sortBy = $request->get('sort_by', 'name');
                $sortDirection = $request->get('sort_direction', 'asc');
                $query->orderBy($sortBy, $sortDirection);

                $roles = $query->paginate(15)->withQueryString();

                return Inertia::render('Admin/Roles/Index', [
                        'roles' => RoleResource::collection($roles),
                        'filters' => $request->only(['search', 'sort_by', 'sort_direction']),
                ]);
        }

        /**
         * Show the form for creating a new resource.
         */
        public function create()
        {
                $permissions = Permission::orderBy('name')->get()->groupBy(function ($permission) {
                        return explode(' ', $permission->name)[0];
                });

                return Inertia::render('Admin/Roles/Create', [
                        'permissions' => $permissions,
                ]);
        }

        /**
         * Store a newly created resource in storage.
         */
        public function store(StoreRoleRequest $request)
        {
                $role = Role::create([
                        'name' => $request->name,
                        'guard_name' => 'web',
                ]);

                if ($request->has('permissions')) {
                        $role->syncPermissions($request->permissions);
                }

                return redirect()->route('admin.roles.index')
                        ->with('success', 'Роль успешно создана.');
        }

        /**
         * Display the specified resource.
         */
        public function show(Role $role)
        {
                $role->load('permissions', 'users');

                return Inertia::render('Admin/Roles/Show', [
                        'role' => new RoleResource($role),
                ]);
        }

        /**
         * Show the form for editing the specified resource.
         */
        public function edit(Role $role)
        {
                $permissions = Permission::orderBy('name')->get()->groupBy(function ($permission) {
                        return explode(' ', $permission->name)[0];
                });

                $role->load('permissions');

                return Inertia::render('Admin/Roles/Edit', [
                        'role' => $role,
                        'permissions' => $permissions,
                ]);
        }

        /**
         * Update the specified resource in storage.
         */
        public function update(UpdateRoleRequest $request, Role $role)
        {
                $role->update([
                        'name' => $request->name,
                ]);

                if ($request->has('permissions')) {
                        $role->syncPermissions($request->permissions);
                }

                return redirect()->route('admin.roles.index')
                        ->with('success', 'Роль успешно обновлена.');
        }

        /**
         * Remove the specified resource from storage.
         */
        public function destroy(Role $role)
        {
                // Prevent deletion of super-admin role
                if ($role->name === 'super-admin') {
                        return redirect()->back()
                                ->with('error', 'Нельзя удалить роль super-admin.');
                }

                $role->delete();

                return redirect()->route('admin.roles.index')
                        ->with('success', 'Роль успешно удалена.');
        }
}
