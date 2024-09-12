import React from 'react';
import Button from '@mui/joy/Button';
import Link from 'next/link';

const ButtonComponent = ({ burat, href }) => {
  return (
    <Button component={Link} href={href}>
      {burat}
    </Button>
  )
}

export default ButtonComponent