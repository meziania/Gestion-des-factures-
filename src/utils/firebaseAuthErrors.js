/** Messages utilisateur pour les codes d'erreur Firebase Auth. */
export function mapFirebaseAuthError(error) {
  const code = error?.code
  switch (code) {
    case 'auth/invalid-email':
      return 'Adresse email invalide.'
    case 'auth/user-disabled':
      return 'Ce compte a été désactivé.'
    case 'auth/user-not-found':
      return 'Aucun compte avec cet email.'
    case 'auth/wrong-password':
      return 'Mot de passe incorrect.'
    case 'auth/invalid-credential':
      return 'Email ou mot de passe incorrect.'
    case 'auth/email-already-in-use':
      return 'Un compte existe déjà avec cet email.'
    case 'auth/weak-password':
      return 'Mot de passe trop faible (minimum 6 caractères).'
    case 'auth/too-many-requests':
      return 'Trop de tentatives. Réessayez plus tard.'
    case 'auth/network-request-failed':
      return 'Problème réseau. Vérifiez votre connexion.'
    default:
      return error?.message || "Erreur d'authentification."
  }
}
