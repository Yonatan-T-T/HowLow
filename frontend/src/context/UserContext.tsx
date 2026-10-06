import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import type { User } from "../types/auction";
import { api } from "../services/api";

interface UserContextType {
  currentUser: User | null;
  users: User[];
  isLoading: boolean;
  switchUser: (userId: number) => void;
  refreshUser: () => Promise<void>;
  isTopUpOpen: boolean;
  openTopUp: () => void;
  closeTopUp: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isTopUpOpen, setIsTopUpOpen] = useState<boolean>(false);

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const fetchedUsers = await api.getUsers();
      setUsers(fetchedUsers);

      const storedUserJson = localStorage.getItem("unique_low_user");
      let activeUser: User | null = null;

      if (storedUserJson) {
        try {
          const parsed = JSON.parse(storedUserJson);
          activeUser = fetchedUsers.find((u) => u.id === parsed.id) || null;
        } catch {
          activeUser = null;
        }
      }

      if (!activeUser && fetchedUsers.length > 0) {
        // Default to a regular user for public experience (Bob), or the first user
        activeUser =
          fetchedUsers.find((u) => u.role === "User") || fetchedUsers[0];
      }

      if (activeUser) {
        setCurrentUser(activeUser);
        localStorage.setItem("unique_low_user", JSON.stringify(activeUser));
      }
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const switchUser = (userId: number) => {
    const user = users.find((u) => u.id === userId);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem("unique_low_user", JSON.stringify(user));
    }
  };

  const refreshUser = async () => {
    if (!currentUser) return;
    try {
      const updated = await api.getUserById(currentUser.id);
      setCurrentUser(updated);
      localStorage.setItem("unique_low_user", JSON.stringify(updated));
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    } catch (err) {
      console.error("Failed to refresh user:", err);
    }
  };

  const openTopUp = () => {
    if (currentUser?.role !== "Admin") {
      setIsTopUpOpen(true);
    }
  };
  const closeTopUp = () => setIsTopUpOpen(false);

  return (
    <UserContext.Provider
      value={{
        currentUser,
        users,
        isLoading,
        switchUser,
        refreshUser,
        isTopUpOpen,
        openTopUp,
        closeTopUp,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
