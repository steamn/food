<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

uses(RefreshDatabase::class);

beforeEach(function () {
    // Create roles first
    Role::create(['name' => 'super-admin', 'guard_name' => 'web']);
    Role::create(['name' => 'admin', 'guard_name' => 'web']);
    Role::create(['name' => 'customer', 'guard_name' => 'web']);

    $this->user = User::factory()->create();
    $this->user->assignRole('super-admin');
    $this->actingAs($this->user);
});

it('can view permissions index page', function () {
    $response = $this->get(route('admin.permissions.index'));

    $response->assertStatus(200);
    $response->assertInertia(
        fn($page) => $page
            ->component('Admin/Permissions/Index')
            ->has('permissions')
            ->has('filters')
            ->has('groups')
    );
});

it('can view create permission page', function () {
    $response = $this->get(route('admin.permissions.create'));

    $response->assertStatus(200);
    $response->assertInertia(
        fn($page) => $page
            ->component('Admin/Permissions/Create')
    );
});

it('can create a new permission', function () {
    $permissionData = [
        'name' => 'test permission',
    ];

    $response = $this->post(route('admin.permissions.store'), $permissionData);

    $response->assertRedirect(route('admin.permissions.index'));
    $response->assertSessionHas('success', 'Разрешение успешно создано.');

    $this->assertDatabaseHas('permissions', [
        'name' => 'test permission',
        'guard_name' => 'web',
    ]);
});

it('can view permission show page', function () {
    $permission = Permission::create(['name' => 'test permission', 'guard_name' => 'web']);

    $response = $this->get(route('admin.permissions.show', $permission));

    $response->assertStatus(200);
    $response->assertInertia(
        fn($page) => $page
            ->component('Admin/Permissions/Show')
            ->has('permission')
    );
});

it('can view edit permission page', function () {
    $permission = Permission::create(['name' => 'test permission', 'guard_name' => 'web']);

    $response = $this->get(route('admin.permissions.edit', $permission));

    $response->assertStatus(200);
    $response->assertInertia(
        fn($page) => $page
            ->component('Admin/Permissions/Edit')
            ->has('permission')
    );
});

it('can update a permission', function () {
    $permission = Permission::create(['name' => 'test permission', 'guard_name' => 'web']);

    $updateData = [
        'name' => 'updated permission',
    ];

    $response = $this->put(route('admin.permissions.update', $permission), $updateData);

    $response->assertRedirect(route('admin.permissions.index'));
    $response->assertSessionHas('success', 'Разрешение успешно обновлено.');

    $this->assertDatabaseHas('permissions', [
        'id' => $permission->id,
        'name' => 'updated permission',
    ]);
});

it('can delete a permission', function () {
    $permission = Permission::create(['name' => 'test permission', 'guard_name' => 'web']);

    $response = $this->delete(route('admin.permissions.destroy', $permission));

    $response->assertRedirect(route('admin.permissions.index'));
    $response->assertSessionHas('success', 'Разрешение успешно удалено.');

    $this->assertDatabaseMissing('permissions', [
        'id' => $permission->id,
    ]);
});

it('validates permission name is required', function () {
    $response = $this->post(route('admin.permissions.store'), []);

    $response->assertSessionHasErrors(['name']);
});

it('validates permission name is unique', function () {
    Permission::create(['name' => 'existing permission', 'guard_name' => 'web']);

    $response = $this->post(route('admin.permissions.store'), [
        'name' => 'existing permission',
    ]);

    $response->assertSessionHasErrors(['name']);
});

it('shows permission with roles', function () {
    $permission = Permission::create(['name' => 'test permission', 'guard_name' => 'web']);
    $role = Role::where('name', 'admin')->first();
    $role->givePermissionTo($permission);

    $response = $this->get(route('admin.permissions.show', $permission));

    $response->assertStatus(200);
    $response->assertInertia(
        fn($page) => $page
            ->component('Admin/Permissions/Show')
            ->has('permission')
    );
});

it('filters permissions by group', function () {
    Permission::create(['name' => 'view users', 'guard_name' => 'web']);
    Permission::create(['name' => 'create orders', 'guard_name' => 'web']);

    $response = $this->get(route('admin.permissions.index', ['group' => 'view']));

    $response->assertStatus(200);
    $response->assertInertia(
        fn($page) => $page
            ->where(
                'permissions.data',
                fn($permissions) =>
                $permissions->every(fn($permission) => str_starts_with($permission['name'], 'view'))
            )
    );
});

it('searches permissions by name', function () {
    Permission::create(['name' => 'view users', 'guard_name' => 'web']);
    Permission::create(['name' => 'create orders', 'guard_name' => 'web']);

    $response = $this->get(route('admin.permissions.index', ['search' => 'users']));

    $response->assertStatus(200);
    $response->assertInertia(
        fn($page) => $page
            ->where(
                'permissions.data',
                fn($permissions) =>
                $permissions->every(fn($permission) => str_contains($permission['name'], 'users'))
            )
    );
});

it('requires authentication to access permissions', function () {
    auth()->logout();

    $this->get(route('admin.permissions.index'))->assertRedirect('/login');
    $this->get(route('admin.permissions.create'))->assertRedirect('/login');
    $this->post(route('admin.permissions.store'), [])->assertRedirect('/login');
});

it('requires admin role to access permissions', function () {
    $user = User::factory()->create();
    $user->assignRole('customer');
    $this->actingAs($user);

    $this->get(route('admin.permissions.index'))->assertForbidden();
    $this->get(route('admin.permissions.create'))->assertForbidden();
    $this->post(route('admin.permissions.store'), [])->assertForbidden();
});