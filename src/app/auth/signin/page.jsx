"use client";

import { useState } from "react";
import styled from "styled-components";
import {
  Box,
  Grid,
  Typography,
  Stack,
  FormControl,
  FormLabel,
  Input,
  IconButton,
  Button,
  Divider,
} from "@mui/joy";
import PersonIcon from "@mui/icons-material/Person";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import GoogleLogo from "../../../../public/google.svg";
import Link from "next/link";
import { signIn, getSession } from "next-auth/react"; // Import signIn
import { useRouter } from "next/navigation";
import { Paper } from "@mui/material";

const StyledLink = styled(Link)`
  text-decoration: none;
  color: inherit;

  &:hover {
    color: inherit;
  }
`;

export default function Home() {
  const [text, setText] = useState("");
  const [password, setPassword] = useState("");
  const [togglePassword, setTogglePassword] = useState("password");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const result = await signIn("credentials", {
      redirect: false,
      username: text,
      password: password,
    });

    console.log("Google sign-in result:", result);

    if (result.ok) {
      const session = await getSession();
      console.log(session)

      if (session && session.user.role) {
        const userRole = session.user.role.toLowerCase();
        return router.push(`/${userRole}/dashboard`);
      } else {
        setError("Failed to fetch role.");
        setIsLoading(false);
      }
    } else {
      setError("Invalid Credentials!!");
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      // Initiate Google sign-in
      const result = await signIn('google', { redirect: false });

      console.log("Google sign-in result:", result);

      if (result?.error) {
        console.error("Google sign-in error:", result.error);
        setError("Google sign-in failed.");
        return;
      }

      // Fetch session data
      const session = await getSession();
      console.log("Session after Google sign-in:", session);

      if (session?.user?.role) {
        const userRole = session.user.role.toLowerCase();
        router.push(`/${userRole}/dashboard`);
      } else {
        setError("Failed to fetch user role from session.");
      }
    } catch (error) {
      console.error("Error in handleGoogleSignIn:", error);
      setError("An unexpected error occurred.");
    }
  };


  return (
    <>
      <Grid
        container
        spacing={2}
        sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <Grid item lg={4} md={8} sm={10} xs={12}>
          <Paper elevation={2} sx={{ height: "100%" }}>
            <Box
              sx={{
                paddingTop: "4rem",
                paddingBottom: "2rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography level="h1">Tracify</Typography>
            </Box>
            <form onSubmit={handleSubmit}>
              <Box sx={{ padding: "1rem", textAlign: "center" }}>
                <Typography level="h2">Hello</Typography>
                <Typography level="h3">Sign into your Account</Typography>
                <Stack spacing={1} sx={{ paddingY: "2rem", marginX: "3rem" }}>
                  <FormLabel>ID*</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      onChange={(e) => setText(e.target.value)}
                      disabled={isLoading}
                      startDecorator={<PersonIcon fontSize="small" />}
                      autoFocus
                      required
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Password*</FormLabel>
                    <Input
                      type={togglePassword}
                      disabled={isLoading}
                      onChange={(e) => setPassword(e.target.value)}
                      endDecorator={
                        password === "" ? null : (
                          <IconButton
                            onClick={() =>
                              setTogglePassword((i) =>
                                i === "password" ? "text" : "password"
                              )
                            }
                          >
                            {togglePassword === "password" ? (
                              <VisibilityIcon fontSize="small" />
                            ) : (
                              <VisibilityOffIcon fontSize="small" />
                            )}
                          </IconButton>
                        )
                      }
                      startDecorator={<VpnKeyIcon fontSize="small" />}
                      required
                    />
                  </FormControl>

                  <Typography
                    level="p"
                    sx={{
                      fontSize: "0.9rem",
                      textAlign: "right",
                      marginTop: "0.5rem",
                      marginBottom: "5rem",
                    }}
                  >
                    <StyledLink href="#forgot-password">
                      Forgot your password?
                    </StyledLink>
                  </Typography>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    loading={isLoading}
                  >
                    Login
                  </Button>
                  <Divider>Or</Divider>
                  <Button
                    color="neutral"
                    variant="soft"
                    startDecorator={<GoogleLogo width={30} height={30} />}
                    disabled={isLoading}
                    sx={{ marginTop: "1rem" }}
                    onClick={handleGoogleSignIn} // Trigger Google Sign-In
                  >
                    Sign in using Google
                  </Button>
                  <Typography color="danger">
                    {error && error}
                  </Typography>
                </Stack>
              </Box>
            </form>
          </Paper>
        </Grid>
      </Grid>
    </>
  );
}
