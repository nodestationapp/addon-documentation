import { useState } from "react";
import { useFormik } from "formik";

import Chip from "@mui/material/Chip";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import Select from "@mui/material/Select";
import Tooltip from "@mui/material/Tooltip";
import Divider from "@mui/material/Divider";
import Collapse from "@mui/material/Collapse";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";

import { alpha } from "@mui/material/styles";

import { AsideModal } from "@nstation/design-system";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PublicOutlinedIcon from "@mui/icons-material/PublicOutlined";

const permissions_options = [
  {
    label: "Public",
    value: "public",
    icon: <PublicOutlinedIcon fontSize="small" />,
  },
  {
    label: "Client",
    value: "client",
  },
  {
    label: "Admin",
    value: "admin",
  },
];

const getPermissions = (permissions) => {
  let data = {};

  if (permissions?.includes("public")) {
    data = {
      title: "Public Access",
      icon: <PublicOutlinedIcon fontSize="small" />,
      items: [
        {
          title: "Everyone can access the table",
        },
      ],
    };
  } else if (permissions?.length > 0) {
    data = {
      title: "Access Token",
      icon: <LockOutlinedIcon fontSize="small" />,
      items: [
        {
          title: "Header parameter name ",
          badges: [{ label: "access_token", color: "error.light" }],
        },
      ],
    };
  } else {
    data = {
      title: "Access Token",
      items: [
        {
          title: "Permissions are not set",
        },
      ],
    };
  }

  return data;
};

const TableDocsModal = ({ open, data, onClose, isLoading }) => {
  const [copied, setCopied] = useState(false);
  const [collapse, setCollapse] = useState(null);

  if (isLoading) {
    return null;
  }

  const onChangePermissions = (value, index) => {
    const lastValue = value[value.length - 1];

    let temp_endpoints = [...formik?.values?.endpoints];

    if (lastValue === "public") {
      temp_endpoints[index].permissions = ["public"];
    } else {
      value = value.filter((item) => item !== "public");
      temp_endpoints[index].permissions = value;
    }

    formik.setFieldValue("endpoints", temp_endpoints);
  };

  const onCollapse = (index) => {
    setCollapse(index === collapse ? null : index);
  };

  const onSubmit = (values) => {
    console.log(values?.endpoints);
  };

  const formik = useFormik({
    initialValues: {
      endpoints: data,
    },
    onSubmit,
  });

  const docs_data = formik.values?.endpoints?.map((item, index) => {
    const permissions_data = getPermissions(item?.permissions);

    return {
      ...item,
      items: [
        ...(Array.isArray(item?.body) && item?.body?.length > 0
          ? [
              {
                title: "Body parameters",
                card: {
                  items: item.body.map((param) => ({
                    title: param.name,
                    badges: [
                      { label: param.type },
                      ...(param.required
                        ? [{ label: "Required", color: "error.light" }]
                        : []),
                    ],
                  })),
                },
              },
            ]
          : []),
        ...(Array.isArray(item?.query) && item?.query?.length > 0
          ? [
              {
                title: "Query parameters",
                card: {
                  items: item.query.map((param) => ({
                    title: param.name,
                    badges: [
                      { label: param.type },
                      ...(param.required
                        ? [{ label: "Required", color: "error.light" }]
                        : []),
                    ],
                  })),
                },
              },
            ]
          : []),
        {
          title: "Security",
          card: {
            icon: permissions_data?.icon,
            title: permissions_data?.title,
            action: (
              <>
                <Select
                  multiple={true}
                  fullWidth
                  displayEmpty
                  size="medium"
                  variant="outlined"
                  value={item?.permissions}
                  onChange={(e) => onChangePermissions(e.target.value, index)}
                  renderValue={(selected) => {
                    if (selected.length === 0) {
                      return <em>Select permissions</em>;
                    }

                    selected = selected?.map((item, index) => {
                      const part = permissions_options?.find(
                        (part) => part?.value === item
                      );

                      return (
                        <Stack direction="row" alignItems="center" gap={1}>
                          {index > 0 && ", "}
                          {part?.icon}
                          {part?.label}
                        </Stack>
                      );
                    });

                    return selected;
                  }}
                >
                  {permissions_options?.map((item) => (
                    <MenuItem value={item?.value} sx={{ gap: 1 }}>
                      {item?.icon}
                      {item?.label}
                    </MenuItem>
                  ))}
                </Select>
              </>
            ),
            items: permissions_data?.items,
          },
        },
      ],
    };
  });

  return (
    <AsideModal
      open={open}
      width={550}
      onClose={onClose}
      onSubmit={formik.submitForm}
      submitLoading={false}
      submitDisabled={!formik.dirty}
      header="Table Docs"
    >
      <Stack direction="column" gap={2}>
        {docs_data?.map((doc, index) => {
          const color =
            doc?.method === "GET"
              ? "#1191FF"
              : doc?.method === "POST"
              ? "#49CC90"
              : doc?.method === "PUT"
              ? "#E97500"
              : "#F93F3E";

          return (
            <Stack key={index} gap={1} direction="column">
              <Typography variant="body" fontWeight={600}>
                {doc?.description}
              </Typography>
              <Stack
                direction="column"
                sx={(theme) => ({
                  borderRadius: 1,
                  border: `1px solid ${color}`,
                })}
              >
                <Stack
                  direction="row"
                  alignItems="center"
                  p={1.5}
                  gap={1}
                  onClick={() => onCollapse(index)}
                  sx={(theme) => ({
                    cursor: "pointer",
                    backgroundColor: alpha(color, 0.1),
                    "&:hover": {
                      backgroundColor: alpha(color, 0.1),
                    },
                  })}
                >
                  <Chip
                    label={doc?.method}
                    variant="filled"
                    color="#49CC90"
                    sx={{
                      border: "none",
                      color: "#fff",
                      borderRadius: 0.6,
                      backgroundColor: color,
                    }}
                  />
                  <Tooltip
                    title={copied ? "Copied" : "Copy to clipboard"}
                    onMouseLeave={() => setTimeout(() => setCopied(false), 500)}
                    placement="top"
                  >
                    <Typography
                      onClick={(e) => {
                        e.stopPropagation();
                        navigator.clipboard.writeText("/tables/projects");
                        setCopied(true);
                      }}
                      fontWeight={500}
                      sx={(theme) => ({
                        "&:hover": {
                          cursor: "pointer",
                          backgroundColor: alpha(theme.palette.divider, 0.3),
                        },
                      })}
                    >
                      {doc?.path}
                    </Typography>
                  </Tooltip>
                  <Stack direction="row" alignItems="center" gap={1} ml="auto">
                    {/* <PublicOutlinedIcon fontSize="small" /> */}
                    <ExpandMoreIcon />
                  </Stack>
                </Stack>
                <Collapse in={collapse === index}>
                  <Divider />
                  <Stack direction="column" gap={2} p={1.5}>
                    {doc.items.map((item, index) => (
                      <Stack key={index} direction="column" gap={1}>
                        <Typography variant="body" fontWeight={600}>
                          {item?.title}
                        </Typography>
                        {!!item?.card && (
                          <Card sx={{ backgroundColor: "transparent" }}>
                            {!!item?.card?.title && (
                              <CardHeader
                                title={
                                  <Typography
                                    variant="body"
                                    fontWeight={600}
                                    display="flex"
                                    gap={0.7}
                                    alignItems="center"
                                    ml={-0.3}
                                    mb={1}
                                  >
                                    {item?.card?.icon}
                                    {item?.card?.title}
                                  </Typography>
                                }
                              />
                            )}
                            <CardContent
                              sx={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 1,
                              }}
                            >
                              {item?.card?.items?.map((item, index) => (
                                <Stack
                                  key={index}
                                  direction="row"
                                  alignItems="center"
                                  gap={0.5}
                                >
                                  <Typography
                                    variant="caption"
                                    mr={0.5}
                                    fontWeight={500}
                                  >
                                    {item?.title}
                                  </Typography>
                                  {item?.badges?.map((badge, index) => (
                                    <Chip
                                      key={index}
                                      label={badge?.label}
                                      sx={(theme) => ({
                                        pointerEvents: "none",
                                        backgroundColor: "transparent",
                                        borderColor: (theme.vars || theme)
                                          .palette.divider,
                                        borderRadius: 0.6,
                                        height: "20px",

                                        "& .MuiChip-label": {
                                          fontWeight: 500,
                                          px: "4px",
                                          color: badge?.color,
                                          fontSize:
                                            theme.typography.caption.fontSize,
                                        },
                                      })}
                                    />
                                  ))}
                                </Stack>
                              ))}
                              {item?.card?.action}
                            </CardContent>
                          </Card>
                        )}
                      </Stack>
                    ))}
                  </Stack>
                </Collapse>
              </Stack>
            </Stack>
          );
        })}
      </Stack>
    </AsideModal>
  );
};

export default TableDocsModal;
