"use client";

import { useState, useEffect } from "react";
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
  CircularProgress,
} from "@mui/joy";
import PersonIcon from "@mui/icons-material/Person";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import GoogleLogo from "../../public/google.svg";
import Link from "next/link";
import { getSession, signIn, useSession } from "next-auth/react"; // Import signIn and useSession
import { useRouter } from "next/navigation";
import { Paper } from "@mui/material";
import Loading from "./components/Loading";
import Authenticated from "./components/Authenticated";
import Image from "next/image";

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

  const { data: session, status } = useSession(); // Use useSession to get session and status
  const router = useRouter();

  useEffect(() => {
    console.log("Session: ", session)
    console.log("Status: ", status)
    if (status === "authenticated") {
      router.push('dashboard');
    }
  }, [status, router, session]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    const result = await signIn("credentials", {
      redirect: false,
      username: text,
      password: password,
    });

    if (result.ok) {
      const session = await getSession();
      if (session && session.user.roleName) {
        router.push(`/dashboard`);
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
    await signIn("google", { redirect: false, prompt: "select_account" }); // Ensure Google sign-in does not redirect automatically
  };

  if (status === "loading") {
    return (
      <Loading />
    )
  } else if (status === "authenticated") {
    return (
      <Authenticated session={session} />
    )
  }

  return (
    <>
      <Grid
        container
        spacing={2}
        sx={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: '100vh', padding: 2 }}
      >
        <Grid item lg={4} md={6} sm={10} xs={12}>
          <Paper elevation={2}>
            <Box
              sx={{
                position: 'relative',
                width: '100%',
                height: '200px', // Set the height based on your design needs
              }}
            >
              <Image
                priority
                src="/tracify.png"
                alt="tracify"
                fill
                style={{
                  objectFit: 'cover',
                  borderRadius: '4px',
                }}
              />
            </Box>
            <form onSubmit={handleSubmit}>
              <Box sx={{ padding: "0 2rem 2rem 2rem", textAlign: "center" }}>
                <Stack spacing={1}>
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
                        password !== "" && (
                          <IconButton
                            onClick={() =>
                              setTogglePassword((prev) =>
                                prev === "password" ? "text" : "password"
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
                      fontSize: { xs: '0.8rem', md: "0.9rem" },
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
                    onClick={handleGoogleSignIn}
                  >
                    Sign in using Google
                  </Button>
                  {error &&
                    <>
                      <Typography color="danger">
                        {error}
                      </Typography>
                    </>
                  }
                </Stack>
              </Box>
            </form>
          </Paper>
        </Grid>
      </Grid>
    </>
  );
}
