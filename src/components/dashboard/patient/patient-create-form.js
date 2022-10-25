import { useState } from "react";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import * as Yup from "yup";
import { useFormik } from "formik";
import {
  Box,
  Button,
  Card,
  CardContent,
  FormControlLabel,
  FormHelperText,
  Grid,
  MenuItem,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { DatePicker } from '@mui/lab';
import { FileDropzone } from "../../file-dropzone";
import { QuillEditor } from "../../quill-editor";

const genderOptions = [
  {
    label: "Make",
    value: "make",
  },
  {
    label: "Femail",
    value: "femail",
  },
  {
    label: "Other",
    value: "other",
  },
  {
    label: "Unknown",
    value: "unknown",
  },
];

export const PatientCreateForm = (props) => {
  const router = useRouter();
  const [files, setFiles] = useState([]);
  const formik = useFormik({
    initialValues: {
      barcode: "925487986526",
      category: "",
      description: "",
      images: [],
      firstName: "",
      lastName: "",
      birthDate: new Date(),
      newPrice: 0,
      oldPrice: 0,
      sku: "IYV-8745",
      submit: null,
    },
    validationSchema: Yup.object({
      barcode: Yup.string().max(255),
      category: Yup.string().max(255),
      description: Yup.string().max(5000),
      images: Yup.array(),
      firstName: Yup.string().max(255).required(),
      lastName: Yup.string().max(255).required(),
      newPrice: Yup.number().min(0).required(),
      oldPrice: Yup.number().min(0),
      sku: Yup.string().max(255),
    }),
    onSubmit: async (values, helpers) => {
      try {
        // NOTE: Make API request
        toast.success("Product created!");
        router.push("/dashboard/products").catch(console.error);
      } catch (err) {
        console.error(err);
        toast.error("Something went wrong!");
        helpers.setStatus({ success: false });
        helpers.setErrors({ submit: err.message });
        helpers.setSubmitting(false);
      }
    },
  });

  const handleDrop = (newFiles) => {
    setFiles((prevFiles) => [...prevFiles, ...newFiles]);
  };

  const handleRemove = (file) => {
    setFiles((prevFiles) =>
      prevFiles.filter((_file) => _file.path !== file.path)
    );
  };

  const handleRemoveAll = () => {
    setFiles([]);
  };

  const handleStartDateChange = (date) => {
    formik.setFieldValue('birthDate', date);
  };

  return (
    <form onSubmit={formik.handleSubmit} {...props}>
      <Card>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item md={4} xs={12}>
              <Typography variant="h6">Basic details</Typography>
            </Grid>
            <Grid item md={8} xs={12}>
              <TextField
                error={Boolean(
                  formik.touched.firstName && formik.errors.firstName
                )}
                fullWidth
                helperText={formik.touched.firstName && formik.errors.firstName}
                label="First Name"
                name="firstName"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.firstName}
              />
              <TextField
                sx={{ mt: 3, mb: 3 }}
                error={Boolean(
                  formik.touched.lastName && formik.errors.lastName
                )}
                fullWidth
                helperText={formik.touched.lastName && formik.errors.lastName}
                label="Last Name"
                name="lastName"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.lastName}
              />
              <DatePicker
                sx={{ mt: 3, mb: 3 }}
                error={Boolean(
                  formik.touched.birthDate && formik.errors.birthDate
                )}
                fullWidth
                helperText={formik.touched.birthDate && formik.errors.birthDate}
                inputFormat="dd/MM/yyyy"
                label="Date of birth"
                onChange={handleStartDateChange}
                renderInput={(inputProps) => <TextField {...inputProps} />}
                value={formik.values.birthDate}
              />
              <TextField
                sx={{ mt: 3 }}
                error={Boolean(formik.touched.gender && formik.errors.gender)}
                fullWidth
                label="Sex at birth"
                name="gender"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                select
                value={formik.values.gender}
              >
                {genderOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                sx={{ mt: 3 }}
                error={Boolean(formik.touched.phone && formik.errors.phone)}
                fullWidth
                helperText={formik.touched.phone && formik.errors.phone}
                label="Phone number"
                name="phone"
                type="number"
                maxlength="12"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.phone}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          mx: -1,
          mb: -1,
          mt: 3,
        }}
      >
        <Button
          color="error"
          sx={{
            m: 1,
            mr: "auto",
          }}
        >
          Delete
        </Button>
        <Button sx={{ m: 1 }} variant="outlined">
          Cancel
        </Button>
        <Button sx={{ m: 1 }} type="submit" variant="contained">
          Create
        </Button>
      </Box>
    </form>
  );
};
