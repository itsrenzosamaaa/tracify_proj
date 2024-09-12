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
} from "@mui/joy";
import PersonIcon from "@mui/icons-material/Person";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import GoogleLogo from "../../../../public/google.svg";
import Link from "next/link";
import { signIn, useSession } from "next-auth/react"; // Import signIn
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
  const [accounts, setAccounts] = useState([]);
  const [text, setText] = useState("");
  const [password, setPassword] = useState("");
  const [togglePassword, setTogglePassword] = useState("password");
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Redirect only if the session is authenticated
    if (status === "authenticated") {
      router.push(`/${session?.user?.role}/dashboard`);
    }
  }, [session, status, router]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(false);
    setIsLoading(true);

    const account = accounts.find(
      (acc) => acc.username === text && acc.password === password
    );

    if (account) {
      router.push(`/${account.role.toLowerCase()}/dashboard`);
    } else {
      setError(true);
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    // Initiate Google sign-in
    signIn('google', { callbackUrl: '/' }); // Redirect after sign-in
  };

  if (status === "loading") {
    return <div>Loading...</div>; // or you can show a loading spinner
  }

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
                    {error && "Invalid Credentials!"}
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
