"use client";

import { useState, useEffect } from "react";
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
import Image from "next/image";
import { getSession, signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Paper } from "@mui/material";
import Loading from "./components/Loading";
import Authenticated from "./components/Authenticated";
import ClientSearchParamsWrapper from "./components/ClientSearchParamsWrapper";

export default function Home() {
  const [text, setText] = useState("");
  const [password, setPassword] = useState("");
  const [togglePassword, setTogglePassword] = useState("password");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  if (status === "loading") return <Loading />;
  if (status === "authenticated") return <Authenticated session={session} />;

  return (
    <ClientSearchParamsWrapper>
      {(searchParams) => {
        const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

        const handleSubmit = async (e) => {
          e.preventDefault();
          setError("");
          setIsLoading(true);
          try {
            const result = await signIn("credentials", {
              redirect: false,
              username: text.trim(),
              password,
              callbackUrl,
            });

            if (!result.ok) {
              setError("Invalid Credentials!!");
              setIsLoading(false);
            } else {
              await getSession();
              router.replace(result.url);
            }
          } catch (err) {
            setError("Something went wrong. Try again.");
            setIsLoading(false);
          }
        };

        const handleGoogleSignIn = async () => {
          try {
            setIsLoading(true);
            await signIn("google", {
              redirect: false,
              prompt: "select_account",
              callbackUrl,
            });
          } catch (error) {
            setError("Google sign-in failed.");
          } finally {
            setIsLoading(false);
          }
        };

        return (
          <Grid
            container
            spacing={2}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "100vh",
              padding: 2,
            }}
          >
            <Grid item lg={4} md={6} sm={10} xs={12}>
              <Paper elevation={2}>
                <Box
                  sx={{ position: "relative", width: "100%", height: "200px" }}
                >
                  <Image
                    priority
                    src="/tracify.png"
                    alt="Tracify Logo"
                    fill
                    style={{ objectFit: "cover", borderRadius: "4px" }}
                  />
                </Box>
                <form onSubmit={handleSubmit}>
                  <Box
                    sx={{ padding: "0 2rem 2rem 2rem", textAlign: "center" }}
                  >
                    <Stack spacing={1}>
                      <FormLabel>Username*</FormLabel>
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
                          sx={{ mb: 2 }}
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
                        disabled={isLoading}
                        onClick={handleGoogleSignIn}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 1,
                        }}
                      >
                        <Image
                          priority
                          src="/google.svg"
                          alt="Google Logo"
                          width={20}
                          height={20}
                        />
                        Sign in using Google
                      </Button>
                      {error && <Typography color="danger">{error}</Typography>}
                    </Stack>
                  </Box>
                </form>
              </Paper>
            </Grid>
          </Grid>
        );
      }}
    </ClientSearchParamsWrapper>
  );
}
