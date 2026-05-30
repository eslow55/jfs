import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signOut, 
  setPersistence, 
  browserLocalPersistence 
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const AuthContext = createContext();

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado estrictamente dentro de un AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [perfilStaff, setPerfilStaff] = useState(null);
  const [cargando, setCargando] = useState(true);

  // Inicializa la persistencia local robusta para que la sesión no se borre al recargar
  useEffect(() => {
    setPersistence(auth, browserLocalPersistence)
      .catch((err) => console.error("Error al configurar persistencia de sesión:", err));
  }, []);

  // Escucha activa del estado de autenticación conectado con perfiles de Firestore
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUsuario(user);
        
        try {
          // Buscamos si el usuario tiene privilegios en tu colección de usuarios o staff
          const userDoc = await getDoc(doc(db, 'usuarios', user.uid));
          if (userDoc.exists()) {
            setPerfilStaff(userDoc.data());
          } else {
            setPerfilStaff({ rol: 'user' }); // Fallback por defecto si no existe metadata
          }
        } catch (e) {
          console.error("Error leyendo permisos institucionales:", e);
          setPerfilStaff(null);
        }
      } else {
        setUsuario(null);
        setPerfilStaff(null);
      }
      setCargando(false);
    });

    return () => unsubscribe();
  }, []);

  /**
   * Intenta autenticar un usuario en la plataforma.
   * Transforma los códigos de error crudos de Firebase en textos limpios de UI.
   */
  const loginEstructurado = async (email, password) => {
    try {
      const credenciales = await signInWithEmailAndPassword(auth, email.trim(), password);
      return { success: true, user: credenciales.user };
    } catch (error) {
      let mensajeAmigable = 'Ocurrió un error inesperado en el servidor de autenticación.';
      
      switch (error.code) {
        case 'auth/invalid-email':
          mensajeAmigable = 'El formato del correo electrónico ingresado no es válido.';
          break;
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          mensajeAmigable = 'Las credenciales ingresadas son incorrectas o no existen en el staff.';
          break;
        case 'auth/too-many-requests':
          mensajeAmigable = 'Acceso bloqueado temporalmente debido a demasiados intentos fallidos. Intenta más tarde.';
          break;
        default:
          mensajeAmigable = error.message;
      }
      return { success: false, error: mensajeAmigable };
    }
  };

  /**
   * Finaliza la sesión actual del cliente de forma segura.
   */
  const logoutEstructurado = async () => {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      console.error("Error al cerrar sesión de forma segura:", error);
      return { success: false, error: error.message };
    }
  };

  // Exponemos las variables unificando ambas nomenclaturas para que la app nunca rompa por llamadas cruzadas
  const value = {
    usuario,
    perfilStaff,
    cargando,
    isStaff: perfilStaff?.rol === 'admin' || perfilStaff?.rol === 'staff',
    login: loginEstructurado,
    logout: logoutEstructurado,
    desloguear: logoutEstructurado // Alias de seguridad para el Admin.jsx maestro 🚀
  };

  return (
    <AuthContext.Provider value={value}>
      {!cargando && children}
    </AuthContext.Provider>
  );
}