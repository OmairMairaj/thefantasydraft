
import NextAuth from "next-auth";
import axios from "axios";
import CredentialsProvider from "next-auth/providers/credentials";

export default NextAuth({
    providers: [
        CredentialsProvider({
            // The name to display on the sign in form (e.g. "Sign in with...")
            name: "Credentials",
            // `credentials` is used to generate a form on the sign in page.
            // You can specify which fields should be submitted, by adding keys to the `credentials` object.
            // e.g. domain, username, password, 2FA token, etc.
            // You can pass any HTML attribute to the <input> tag through the object.
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials, req) {
                // Add logic here to look up the user from the credentials supplied
                const URL = process.env.NEXT_PUBLIC_BACKEND_URL + "user/login";
                const body = {
                    email: credentials.email,
                    password: credentials.password
                };
                // console.log(body);
                const res = await axios.post(URL, body).then((res) => {
                    console.log(res);
                    return res.data
                    // alert(res.data.message);
                    // if (!res.data.error) {
                    //     router.push("/login");
                    // }
                }).catch((err) => {
                    console.log(err);
                    alert("An unexpected error occurred. Please try again later");
                });

                const user = await res;

                if (user) {
                    // Any object returned will be saved in `user` property of the JWT
                    console.log(user);
                    return user
                } else {
                    // If you return null then an error will be displayed advising the user to check their details.
                    return null

                    // You can also Reject this callback with an Error thus the user will be sent to the error page with the error message as a query parameter
                }
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            return { ...token, ...user };
        },
        async session({ session, token, user }) {
            session.user = token;
            return session;
        },
    },
})