---
name: hierarchy
description: Define the components hierarchy, how to use components inside pages and how to mix components and when it's needed to create new ones.
scope: [components-ui,hooks,stores,app-router]
---

# Component Hierarchy

## Core Principles

1. **Server Components fetch data** - Server Components fetch data directly, Client Components receive data as props
2. **Atomic Design** - Build from atoms → molecules → organisms → pages
3. **Hooks in Client Components** - Custom hooks belong in Client Components (organisms), not Server Components
4. **Performance & SEO first** - Always prioritize unless there's an edge case
5. **Never use `any`** - Under no circumstances

## Atomic Design Hierarchy

```txt
Page (src/app/)
└── Organism (large component with business logic)
    └── Molecule (group of atoms with simple logic)
        └── Atom (single UI element, no logic)
```

### Atoms

Single UI elements with no business logic. Receive props, render UI.

```tsx
// src/ui/custom/Button/Button.tsx
interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary";
  disabled?: boolean;
}

export default function Button({ children, onClick, variant = "primary", disabled }: ButtonProps) {
  return (
    <button onClick={onClick} disabled={disabled} className={`btn btn-${variant}`}>
      {children}
    </button>
  );
}
```

```tsx
// src/ui/custom/Input/Input.tsx
interface InputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: "text" | "email" | "password";
}

export default function Input({ value, onChange, placeholder, type = "text" }: InputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return <input type={type} value={value} onChange={handleChange} placeholder={placeholder} />;
}
```

### Molecules

Group of atoms with simple interaction logic. No hooks, no data fetching.

```tsx
// src/ui/custom/SearchInput/SearchInput.tsx
import Input from "../Input";
import Button from "../Button";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  placeholder?: string;
}

export default function SearchInput({ value, onChange, onSearch, placeholder }: SearchInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      onSearch();
    }
  };

  return (
    <div className="flex gap-2" onKeyDown={handleKeyDown}>
      <Input value={value} onChange={onChange} placeholder={placeholder} />
      <Button onClick={onSearch}>Search</Button>
    </div>
  );
}
```

```tsx
// src/ui/custom/UserCard/UserCard.tsx
import Avatar from "../Avatar";
import Badge from "../Badge";

interface UserCardProps {
  name: string;
  email: string;
  avatarUrl?: string;
  role: "admin" | "user";
}

export default function UserCard({ name, email, avatarUrl, role }: UserCardProps) {
  return (
    <div className="flex items-center gap-4 p-4 border rounded">
      <Avatar src={avatarUrl} alt={name} />
      <div>
        <h3 className="font-bold">{name}</h3>
        <p className="text-gray-500">{email}</p>
      </div>
      <Badge variant={role === "admin" ? "primary" : "secondary"}>{role}</Badge>
    </div>
  );
}
```

### Organisms

Large components with business logic. Can use hooks, stores, and handle complex interactions.

```tsx
// src/ui/custom/UserList/UserList.tsx
import { useState } from "react";
import { useDebounce } from "@/hooks";
import { useUIStore } from "@/stores";
import SearchInput from "../SearchInput";
import UserCard from "../UserCard";

interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: "admin" | "user";
}

interface UserListProps {
  users: User[];
  onUserSelect: (user: User) => void;
}

export default function UserList({ users, onUserSelect }: UserListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 300);
  const { openModal } = useUIStore();

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      user.email.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  const handleUserClick = (user: User) => {
    onUserSelect(user);
    openModal();
  };

  const handleSearch = () => {
    // Optional: trigger immediate search
  };

  return (
    <div className="space-y-4">
      <SearchInput
        value={searchTerm}
        onChange={setSearchTerm}
        onSearch={handleSearch}
        placeholder="Search users..."
      />
      <div className="space-y-2">
        {filteredUsers.map((user) => (
          <div key={user.id} onClick={() => handleUserClick(user)} className="cursor-pointer">
            <UserCard {...user} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Pages (Server Components)

Server Components fetch data directly. Client Components receive data as props.

```tsx
// src/app/users/page.tsx
import { UserList } from "@/components";

async function getUsers() {
  const res = await fetch("https://api.example.com/users", {
    next: { revalidate: 60 },
  });
  return res.json();
}

export default async function UsersPage() {
  const users = await getUsers();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Users</h1>
      <UserList users={users} />
    </div>
  );
}
```

### Pages (Client Components)

When you need interactivity, use Client Components:

```tsx
// src/app/users/page.tsx
"use client";

import { UserList } from "@/components";
import { useUsers } from "@/hooks/users";

export default function UsersPage() {
  const { data: users, isLoading } = useUsers();

  const handleUserSelect = (user: { id: string; name: string }) => {
    console.log("Selected user:", user.id);
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Users</h1>
      <UserList users={users} onUserSelect={handleUserSelect} />
    </div>
  );
}
```

## Data Flow

```txt
Server Data Flow (Server Components):
API → Server Component (fetch) → Organism → Molecule → Atom
                                 (props)    (props)   (props)

Client Data Flow (Client Components):
API → React Query Hook → Client Component → Organism → Molecule → Atom
                         (props)           (props)    (props)   (props)

Client State Flow:
User Action → Atom (onClick) → Molecule (handler) → Organism (hook/store) → UI Update
```

## When to Create a New Component

| Scenario | Create New? | Level |
|----------|-------------|-------|
| Button with icon | No, add `icon` prop to Button | Atom |
| Search bar (input + button) | Yes | Molecule |
| Form with validation | Yes | Organism |
| Repeating UI pattern (3+ times) | Yes | Appropriate level |
| Single-use complex UI | Maybe, if >100 lines | Organism |

## Hook Usage Rules

| Component Level | Can Use Hooks? | Examples |
|-----------------|----------------|----------|
| Atom | No | Button, Input, Badge |
| Molecule | Rarely (only `useState` for local UI) | SearchInput, FormField |
| Organism | Yes | UserList, DataTable, Forms |
| Page | Only for client-side mutations | useUsers.create() |

```tsx
// ❌ BAD: Hook in atom
export default function Button({ label }) {
  const { isLoading } = useUIStore(); // DON'T
  return <button>{label}</button>;
}

// ✅ GOOD: Props in atom
export default function Button({ label, isLoading }) {
  return <button disabled={isLoading}>{label}</button>;
}

// ✅ GOOD: Hook in organism
export default function UserForm({ onSubmit }) {
  const { isLoading, setLoading } = useUIStore();
  const [formData, setFormData] = useState({});

  const handleSubmit = async () => {
    setLoading(true);
    await onSubmit(formData);
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input value={formData.name} onChange={(v) => setFormData({ ...formData, name: v })} />
      <Button isLoading={isLoading}>Submit</Button>
    </form>
  );
}
```

## Server vs Client Data

```tsx
// ✅ GOOD: Server Component fetches data directly
// src/app/users/page.tsx
async function getUsers() {
  const res = await fetch("https://api.example.com/users");
  return res.json();
}

export default async function UsersPage() {
  const users = await getUsers();
  return <UserList users={users} />;
}

// ✅ GOOD: Client Component with hooks for interactivity
// src/app/users/page.tsx
"use client";

import { useUsers } from "@/hooks/users";

export default function UsersPage() {
  const { data: users } = useUsers();
  return <UserList users={users} />;
}

// Component receives data as props
export default function UserList({ users }: { users: User[] }) {
  return <div>{users.map(...)}</div>;
}
```

## Client-Side Mutations

For mutations (create, update, delete), use hooks in Client Components:

```tsx
// src/app/users/page.tsx
"use client";

import { useUsers } from "@/hooks/users";

export default function UsersPage() {
  const { data: users } = useUsers();
  const createUser = useUsers.create();
  const deleteUser = useUsers.delete();

  const handleCreate = (data: CreateUserInput) => {
    createUser.mutate(data);
  };

  const handleDelete = (id: string) => {
    deleteUser.mutate(id);
  };

  return (
    <div>
      <UserForm onSubmit={handleCreate} />
      <UserList users={users} onDelete={handleDelete} />
    </div>
  );
}
```

## Important Notes

- **Server Components fetch data directly** - No hooks needed
- **Client Components use hooks** - For interactivity and mutations
- **Props down, events up** - Data flows down, actions bubble up via callbacks
- **Keep atoms pure** - No side effects, no hooks, just UI
- **Organisms are the brain** - Business logic lives here
- **Test at the right level** - Unit test atoms, integration test organisms
- **Never use `any`** - Define proper types for all props and state
- **Handler naming** - `handle*` inside components, `on*` for props from parents
- **Prefer composition** - Build complex UIs by combining simple components
