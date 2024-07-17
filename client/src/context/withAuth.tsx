import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function withAuth(Component: any) {
  return function ProtectedRoute({ ...props }) {
    const usr = localStorage.getItem("user");
    let user = null;
    if (usr) {
      user = JSON.parse(usr);
    }
    const router = useRouter();

    useEffect(() => {
      if (!user) {
        router.push("/login");
      }
    }, [user]);

    return <>{user && <Component {...props} />}</>;
  };
}
