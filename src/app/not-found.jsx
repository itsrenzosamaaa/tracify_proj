import { Box, Typography, Button, Container } from '@mui/joy';

export default function NotFound() {
    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                backgroundColor: 'background.default',
            }}
        >
            <Container
                sx={{
                    textAlign: 'center',
                    backgroundColor: 'background.paper',
                    p: 4,
                    borderRadius: 'md',
                    boxShadow: 4,
                    maxWidth: 500,
                    width: '100%',
                }}
            >
                <Typography level="h1" sx={{ fontSize: '3rem', color: 'text.primary', mb: 2 }}>
                    Oops! Page Not Found
                </Typography>
                <Typography level="body1" sx={{ fontSize: '1.25rem', color: 'text.secondary', mb: 3 }}>
                    We couldn&apos;t find the page you&apos;re looking for. It might have been moved or deleted.
                </Typography>
                <Button
                    component="a"
                    href="/"
                    variant="solid"
                    color="primary"
                    sx={{ fontSize: '1.1rem', px: 4, py: 2 }}
                >
                    Back to Homepage
                </Button>
            </Container>
        </Box>
    );
}
