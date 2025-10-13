<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StorePermissionRequest;
use App\Http\Requests\Admin\UpdatePermissionRequest;
use App\Http\Resources\PermissionResource;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Permission\Models\Permission;

class PermissionController extends Controller
{
        /**
         * Display a listing of the resource.
         */
        public function index(Request $request)
        {
                $query = Permission::query();

                // Search
                if ($request->filled('search')) {
                        $search = $request->get('search');
                        $query->where('name', 'like', "%{$search}%");
                }

                // Filter by group
                if ($request->filled('group')) {
                        $group = $request->get('group');
                        $query->where('name', 'like', "{$group}%");
                }

                // Sort
                $sortBy = $request->get('sort_by', 'name');
                $sortDirection = $request->get('sort_direction', 'asc');
                $query->orderBy($sortBy, $sortDirection);

                $permissions = $query->paginate(20)->withQueryString();

                // Get available groups for filter
                $groups = Permission::all()
                        ->map(function ($permission) {
                                return explode(' ', $permission->name)[0];
                        })
                        ->unique()
                        ->sort()
                        ->values();

                return Inertia::render('Admin/Permissions/Index', [
                        'permissions' => PermissionResource::collection($permissions),
                        'filters' => $request->only(['search', 'group', 'sort_by', 'sort_direction']),
                        'groups' => $groups,
                ]);
        }

        /**
         * Show the form for creating a new resource.
         */
        public function create()
        {
                return Inertia::render('Admin/Permissions/Create');
        }

        /**
         * Store a newly created resource in storage.
         */
        public function store(StorePermissionRequest $request)
        {
                Permission::create([
                        'name' => $request->name,
                        'guard_name' => 'web',
                ]);

                return redirect()->route('admin.permissions.index')
                        ->with('success', 'Разрешение успешно создано.');
        }

        /**
         * Display the specified resource.
         */
        public function show(Permission $permission)
        {
                $permission->load('roles');

                return Inertia::render('Admin/Permissions/Show', [
                        'permission' => new PermissionResource($permission),
                ]);
        }

        /**
         * Show the form for editing the specified resource.
         */
        public function edit(Permission $permission)
        {
                $permission->load('roles');

                return Inertia::render('Admin/Permissions/Edit', [
                        'permission' => new PermissionResource($permission),
                ]);
        }

        /**
         * Update the specified resource in storage.
         */
        public function update(UpdatePermissionRequest $request, Permission $permission)
        {
                $permission->update([
                        'name' => $request->name,
                ]);

                return redirect()->route('admin.permissions.index')
                        ->with('success', 'Разрешение успешно обновлено.');
        }

        /**
         * Remove the specified resource from storage.
         */
        public function destroy(Permission $permission)
        {
                $permission->delete();

                return redirect()->route('admin.permissions.index')
                        ->with('success', 'Разрешение успешно удалено.');
        }
}
