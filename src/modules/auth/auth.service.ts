import { ref } from "vue";
import type { AccessScopesEnum } from "@/modules/auth/auth.types";

function createService() {
  const userScopes = ref<Record<AccessScopesEnum, boolean | undefined> | null>(null);

  async function fetchUserOnes(): Promise<void> {
    if (userScopes.value) return;
    const req = await fetch("https://laiqzumifkyctdwwyyjd.supabase.co/rest/v1/mocks?id=eq.1&select=payload", {
      headers: {
        apikey:
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhaXF6dW1pZmt5Y3Rkd3d5eWpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NTkyNDk1NzksImV4cCI6MTk3NDgyNTU3OX0.V6TxTMgJpH10VlBlVJVsh2zQDRGjydn2E9cNSzQPLjQ",
      },
    });

    const [{ payload }] = await req.json();

    userScopes.value = payload.scopes.reduce(
      (acc: Record<AccessScopesEnum, boolean | undefined>, curr: AccessScopesEnum) => {
        acc[curr] = true;
        return acc;
      },
      {},
    );
  }

  function checkHasScope(scopes: AccessScopesEnum[]) {
    if (!userScopes.value) return false;

    // Тернарник, потому что тайпскрипт подтупливает
    return scopes.some(scope => (userScopes.value ? userScopes.value[scope] : false));
  }

  return {
    fetchUserOnes,
    checkHasScope,
  };
}

type IService = ReturnType<typeof createService>;
let singletonService: ReturnType<typeof createService> | null = null;

function useService(): IService {
  if (!singletonService) singletonService = createService();
  return singletonService;
}

export { createService as createAuthService, useService as useAuthService };
