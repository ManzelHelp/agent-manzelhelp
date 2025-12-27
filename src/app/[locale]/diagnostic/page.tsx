"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { diagnoseUserAccount } from "@/actions/diagnostic";
import { CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react";

export default function DiagnosticPage() {
  const [diagnostics, setDiagnostics] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runDiagnostic = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await diagnoseUserAccount();
      if (result.success) {
        setDiagnostics(result.diagnostics);
      } else {
        setError(result.error || "Unknown error");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            🔍 Diagnostic du Compte Utilisateur
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Button onClick={runDiagnostic} disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Diagnostic en cours...
              </>
            ) : (
              "Lancer le Diagnostic"
            )}
          </Button>

          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-800 dark:text-red-200 font-semibold">
                Erreur: {error}
              </p>
            </div>
          )}

          {diagnostics && (
            <div className="space-y-4">
              {/* Auth User */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    {diagnostics.authUser.exists ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    1. Utilisateur Auth (auth.users)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {diagnostics.authUser.exists ? (
                    <div className="space-y-2 text-sm">
                      <p>
                        <strong>ID:</strong> {diagnostics.authUser.id}
                      </p>
                      <p>
                        <strong>Email:</strong> {diagnostics.authUser.email || "N/A"}
                      </p>
                      <p>
                        <strong>Rôle:</strong> {diagnostics.authUser.role || "N/A"}
                      </p>
                    </div>
                  ) : (
                    <p className="text-red-600">❌ Utilisateur non authentifié</p>
                  )}
                </CardContent>
              </Card>

              {/* DB User */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    {diagnostics.dbUser.exists ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    2. Utilisateur dans la Table users
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {diagnostics.dbUser.exists ? (
                    <div className="space-y-2 text-sm">
                      <p>
                        <strong>ID:</strong> {diagnostics.dbUser.id}
                      </p>
                      <p>
                        <strong>Email:</strong> {diagnostics.dbUser.email || "N/A"}
                      </p>
                      <p>
                        <strong>Rôle:</strong> {diagnostics.dbUser.role || "N/A"}
                      </p>
                      <p className="text-green-600 text-xs mt-2">
                        ✅ L'utilisateur existe dans la table users
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-red-600 font-semibold">
                        ❌ PROBLÈME: L'utilisateur n'existe PAS dans la table users
                      </p>
                      {diagnostics.dbUser.error && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
                          <p className="text-sm text-red-700 dark:text-red-300 font-mono">
                            {diagnostics.dbUser.error}
                          </p>
                        </div>
                      )}
                      {diagnostics.canCreateUser && (
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
                          <p className="text-sm font-semibold mb-1">Test de création:</p>
                          {diagnostics.canCreateUser.canCreate ? (
                            <p className="text-green-600 text-sm">
                              ✅ La création est possible
                            </p>
                          ) : (
                            <div>
                              <p className="text-red-600 text-sm font-semibold">
                                ❌ La création échoue:
                              </p>
                              <p className="text-sm text-red-500 font-mono mt-1">
                                {diagnostics.canCreateUser.error}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        💡 Solution: L'utilisateur doit être créé automatiquement. Si ce n'est pas le cas, vérifiez les logs serveur.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Tasker Profile */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    {diagnostics.taskerProfile.exists ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-yellow-500" />
                    )}
                    3. Profil Tasker (tasker_profiles)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {diagnostics.taskerProfile.exists ? (
                    <div className="space-y-2 text-sm">
                      <p>
                        <strong>ID:</strong> {diagnostics.taskerProfile.id}
                      </p>
                      <p>
                        <strong>Statut de vérification:</strong>{" "}
                        {diagnostics.taskerProfile.verification_status || "N/A"}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-yellow-600">
                        ⚠️ Pas de profil tasker (normal si vous êtes customer)
                      </p>
                      {diagnostics.taskerProfile.error && (
                        <p className="text-sm text-yellow-500">
                          Erreur: {diagnostics.taskerProfile.error}
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* RLS Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    {diagnostics.rlsStatus.canRead ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    4. Statut RLS (Row Level Security)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong>Peut lire son propre utilisateur:</strong>{" "}
                      {diagnostics.rlsStatus.canRead ? (
                        <span className="text-green-600">✅ Oui</span>
                      ) : (
                        <span className="text-red-600">❌ Non</span>
                      )}
                    </p>
                    <p>
                      <strong>Peut lire tous les utilisateurs:</strong>{" "}
                      {diagnostics.rlsStatus.canReadAll ? (
                        <span className="text-green-600">✅ Oui</span>
                      ) : (
                        <span className="text-red-600">❌ Non</span>
                      )}
                    </p>
                    {diagnostics.rlsStatus.error && (
                      <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-800 mt-2">
                        <p className="text-sm text-yellow-700 dark:text-yellow-300">
                          ⚠️ {diagnostics.rlsStatus.error}
                        </p>
                        <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                          Si vous voyez cette erreur, les politiques RLS bloquent probablement la lecture. Vérifiez les politiques RLS dans Supabase.
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Summary */}
              <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                <CardHeader>
                  <CardTitle className="text-lg">📋 Résumé</CardTitle>
                </CardHeader>
                <CardContent>
                  {!diagnostics.dbUser.exists ? (
                    <div className="space-y-2">
                      <p className="font-semibold text-red-600">
                        ❌ PROBLÈME IDENTIFIÉ
                      </p>
                      <p>
                        L'utilisateur existe dans <code>auth.users</code> mais{" "}
                        <strong>N'EXISTE PAS</strong> dans la table{" "}
                        <code>users</code>.
                      </p>
                      {diagnostics.dbUser.error?.includes("RLS") && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800 mt-2">
                          <p className="text-sm font-semibold text-red-700 dark:text-red-300">
                            ⚠️ PROBLÈME RLS DÉTECTÉ
                          </p>
                          <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                            Les politiques RLS bloquent probablement la lecture de la table users. Même si l'utilisateur existe, le code ne peut pas le voir à cause des politiques RLS.
                          </p>
                          <p className="text-xs text-red-500 dark:text-red-400 mt-2">
                            Solution: Vérifiez les politiques RLS dans Supabase → Authentication → Policies → users
                          </p>
                        </div>
                      )}
                      <p className="text-sm mt-2">
                        <strong>Solution:</strong> Le code devrait créer automatiquement l'utilisateur. Vérifiez les logs serveur pour voir pourquoi la création échoue.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="font-semibold text-green-600">
                        ✅ Tout semble correct
                      </p>
                      <p>
                        L'utilisateur existe dans les deux tables. Si vous avez toujours des erreurs, vérifiez les logs serveur pour plus de détails.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

