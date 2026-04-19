import React from 'react'
import { useFormik } from 'formik'
import * as yup from 'yup'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useAuth } from '../contexts/AuthContext.jsx'
import { mapFirebaseAuthError } from '../utils/firebaseAuthErrors.js'

const schema = yup.object({
  email: yup.string().email('Email invalide').required('Email requis'),
  password: yup
    .string()
    .min(6, 'Minimum 6 caractères (exigence Firebase)')
    .required('Mot de passe requis'),
  confirm: yup
    .string()
    .oneOf([yup.ref('password')], 'Les mots de passe ne correspondent pas')
    .required('Confirmation requise'),
})

export default function RegisterPage() {
  const { register, firebaseReady } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = React.useState(null)

  const formik = useFormik({
    initialValues: { email: '', password: '', confirm: '' },
    validationSchema: schema,
    onSubmit: async (values) => {
      setError(null)
      try {
        await register({ email: values.email, password: values.password })
        navigate('/dashboard', { replace: true })
      } catch (e) {
        setError(mapFirebaseAuthError(e))
      }
    },
  })

  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', p: 2 }}>
      <Card sx={{ width: 'min(520px, 100%)' }}>
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="h5">Créer un compte</Typography>
            <Typography variant="body2" color="text.secondary">
              Un document <code>users/&lt;uid&gt;</code> sera créé dans la Realtime Database avec le
              rôle <code>user</code>. Pour promouvoir un admin, modifiez{' '}
              <code>users/&lt;uid&gt;/role</code> à <code>admin</code> dans la console Firebase.
            </Typography>
            {!firebaseReady ? (
              <Alert severity="warning">
                Variables Firebase manquantes. Configurez <code>.env</code> (voir{' '}
                <code>.env.example</code>).
              </Alert>
            ) : null}
            {error ? <Alert severity="error">{error}</Alert> : null}

            <form onSubmit={formik.handleSubmit}>
              <Stack spacing={2}>
                <TextField
                  label="Email"
                  name="email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.email && Boolean(formik.errors.email)}
                  helperText={formik.touched.email ? formik.errors.email : ''}
                  autoComplete="email"
                  fullWidth
                />
                <TextField
                  label="Mot de passe"
                  name="password"
                  type="password"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.password && Boolean(formik.errors.password)}
                  helperText={formik.touched.password ? formik.errors.password : ''}
                  autoComplete="new-password"
                  fullWidth
                />
                <TextField
                  label="Confirmer le mot de passe"
                  name="confirm"
                  type="password"
                  value={formik.values.confirm}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.confirm && Boolean(formik.errors.confirm)}
                  helperText={formik.touched.confirm ? formik.errors.confirm : ''}
                  autoComplete="new-password"
                  fullWidth
                />
                <Button type="submit" variant="contained" size="large" disabled={!firebaseReady}>
                  S&apos;inscrire
                </Button>
                <Typography variant="body2" align="center">
                  <Button component={RouterLink} to="/login" size="small">
                    Déjà un compte ? Connexion
                  </Button>
                </Typography>
              </Stack>
            </form>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  )
}
