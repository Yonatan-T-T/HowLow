import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import type { User, TestProfile } from "../types/auction";
import { api } from "../services/api";

const PRESET_TEST_PROFILES: TestProfile[] = [
  {
    username: "admin1",
    email: "admin1@uniquelow.com",
    password: "AdminPassword123!",
    role: "Admin",
    balance: 1000.0,
  },
  {
    username: "admin2",
    email: "admin2@uniquelow.com",
    password: "AdminPassword123!",
    role: "Admin",
    balance: 1000.0,
  },
  {
    username: "bob",
    email: "bob@example.com",
    password: "UserPassword123!",
    role: "User",
    balance: 250.0,
  },
  {
    username: "charlie",
    email: "charlie@example.com",
    password: "UserPassword123!",
    role: "User",
    balance: 180.0,
  },
  {
    username: "diana",
    email: "diana@example.com",
    password: "UserPassword123!",
    role: "User",
    balance: 220.0,
  },
  {
    username: "evan",
    email: "evan@example.com",
    password: "UserPassword123!",
    role: "User",
    balance: 150.0,
  },
  {
    username: "fiona",
    email: "fiona@example.com",
    password: "UserPassword123!",
    role: "User",
    balance: 300.0,
  },
];

interface UserContextType {
  currentUser: User | null;
  users: User[];
  testProfiles: TestProfile[];
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (usernameOrEmail: string, password: string) => Promise<{ success: boolean; message: string }>;
  signup: (username: string, email: string, password: string, role?: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  switchUser: (userId: number) => void;
  quickLoginAs: (profile: TestProfile) => Promise<{ success: boolean; message: string }>;
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
  const [testProfiles, setTestProfiles] = useState<TestProfile[]>(PRESET_TEST_PROFILES);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isTopUpOpen, setIsTopUpOpen] = useState<boolean>(false);

  // Load session & initial users
  const initAuth = useCallback(async () => {
    try {
      setIsLoading(true);

      // Fetch test profiles & all users concurrently
      try {
        const [fetchedUsers, fetchedProfiles] = await Promise.all([
          api.getUsers().catch(() => []),
          api.getTestProfiles().catch(() => PRESET_TEST_PROFILES),
        ]);
        if (fetchedUsers.length > 0) setUsers(fetchedUsers);
        if (fetchedProfiles && fetchedProfiles.length > 0) setTestProfiles(fetchedProfiles);
      } catch (err) {
        console.warn("Could not fetch remote users/profiles:", err);
      }

      // Check stored user session
      const storedUserJson = localStorage.getItem("unique_low_user");
      if (storedUserJson) {
        try {
          const parsed = JSON.parse(storedUserJson);
          if (parsed?.id) {
            setCurrentUser(parsed);
            // Verify and refresh with backend
            api.getUserById(parsed.id)
              .then((fresh) => {
                if (fresh) {
                  setCurrentUser(fresh);
                  localStorage.setItem("unique_low_user", JSON.stringify(fresh));
                }
              })
              .catch(() => {
                // Keep parsed if offline/network hiccup
              });
          }
        } catch {
          localStorage.removeItem("unique_low_user");
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  const login = async (usernameOrEmail: string, password: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await api.login(usernameOrEmail, password);
      if (response.success && response.user) {
        setCurrentUser(response.user);
        localStorage.setItem("unique_low_user", JSON.stringify(response.user));
        if (response.token) {
          localStorage.setItem("unique_low_token", response.token);
        }
        return { success: true, message: response.message || "Logged in successfully!" };
      }
      return { success: false, message: response.message || "Login failed." };
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || "Invalid username or password. Please try again.";
      return { success: false, message: errorMsg };
    }
  };

  const signup = async (
    username: string,
    email: string,
    password: string,
    role = "User"
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await api.register(username, email, password, role);
      if (response.success && response.user) {
        setCurrentUser(response.user);
        localStorage.setItem("unique_low_user", JSON.stringify(response.user));
        if (response.token) {
          localStorage.setItem("unique_low_token", response.token);
        }
        // Refresh users list so new user appears in system
        api.getUsers().then(setUsers).catch(() => {});
        return { success: true, message: response.message || "Registration successful!" };
      }
      return { success: false, message: response.message || "Sign up failed." };
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || "Registration failed. Please check your information.";
      return { success: false, message: errorMsg };
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem("unique_low_user");
    localStorage.removeItem("unique_low_token");
  };

  const switchUser = (userId: number) => {
    const user = users.find((u) => u.id === userId);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem("unique_low_user", JSON.stringify(user));
    }
  };

  const quickLoginAs = async (profile: TestProfile): Promise<{ success: boolean; message: string }> => {
    return await login(profile.username, profile.password);
  };

  const refreshUser = async () => {
    if (!currentUser) return;
    try {
      const updated = await api.getUserById(currentUser.id);
      if (updated) {
        setCurrentUser(updated);
        localStorage.setItem("unique_low_user", JSON.stringify(updated));
        setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
      }
    } catch (err) {
      console.error("Failed to refresh user:", err);
    }
  };

  const openTopUp = () => {
    if (currentUser && currentUser.role !== "Admin") {
      setIsTopUpOpen(true);
    }
  };

  const closeTopUp = () => setIsTopUpOpen(false);

  return (
    <UserContext.Provider
      value={{
        currentUser,
        users,
        testProfiles,
        isAuthenticated: !!currentUser,
        isLoading,
        login,
        signup,
        logout,
        switchUser,
        quickLoginAs,
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
