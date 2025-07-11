import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActionArea from "@mui/material/CardActionArea";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { Box } from "@mui/material";

type Product = {
  productId: string;
  name: string;
  price: number;
  images: string[];
  onDiscount?: boolean;
  discountPrice?: number;
};

interface ProductCardProps {
  product: Product;
  onClick: (productId: string) => void;
  onAddToCart?: (productId: string) => void; // optional callback
}

export default function ProductCard({
  product,
  onClick,
  onAddToCart,
}: ProductCardProps) {
  const formatPrice = (price: number) =>
    new Intl.NumberFormat("sr-RS", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);

  return (
    <Card
      sx={{
        width: 280,
        height: 350,
        borderRadius: 3,
        overflow: "hidden",
        position: "relative",
        boxShadow: 3,
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        "&:hover": {
          transform: "translateY(-5px)",
          boxShadow: 6,
        },
      }}
    >
      <CardActionArea
        onClick={() => onClick(product.productId)}
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          height: "100%",
          position: "relative",
        }}
      >
        {/* Gornji gradient */}
        <Box
          sx={{
            width: "100%",
            height: 200,
            background: "linear-gradient(135deg,#e7cfb4 50%, #FFF 50%)",
          }}
        />

        {/* Prikaz cene */}
        <Box
          sx={{
            position: "absolute",
            top: 35,
            left: 16,
            px: 2,
            py: 1,
            background: "linear-gradient(135deg, #e7cfb4,rgb(190, 147, 98))",
            borderRadius: 2,
            color: "#fff",
            boxShadow: 2,
            zIndex: "2",
          }}
        >
          {product.onDiscount && product.discountPrice ? (
            <Box>
              <Typography
                variant="body2"
                sx={{
                  textDecoration: "line-through",
                  color: "#eee",
                  fontSize: "0.9rem",
                }}
              >
                {formatPrice(product.price)} RSD
              </Typography>
              <Typography
                variant="body1"
                sx={{ fontWeight: "bold", color: "#fff" }}
              >
                {formatPrice(product.discountPrice)} RSD
              </Typography>
            </Box>
          ) : (
            <Typography variant="body1" sx={{ fontWeight: "bold" }}>
              {formatPrice(product.price)} RSD
            </Typography>
          )}
        </Box>

        {/* Krug sa slikom proizvoda */}
        <Box
          sx={{
            width: 200,
            height: 200,
            borderRadius: "50%",
            backgroundColor: "#fff",
            overflow: "hidden",
            position: "absolute",
            top: 50,
            right: 10,
            boxShadow: 2,
          }}
        >
          <img
            src={product.images[0] || "fallback-image.jpg"}
            alt={product.name}
            loading="lazy"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
            }}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = "fallback-image.jpg";
            }}
          />
        </Box>

        {/* Ime proizvoda + opis */}
        <CardContent
          sx={{
            width: "100%",
            flexGrow: 1,
            mt: 14,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            alignItems: "center",
            pb: 0,
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              textAlign: "left",
              mt: 3,
              maxWidth: "80%",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {product.name}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              textAlign: "center",
              color: "#666",
              m: 1,
              maxWidth: "85%",
            }}
          >        
          </Typography>
        </CardContent>
      </CardActionArea>

      {/* Dugme "Dodaj u korpu" */}
      <Box
        sx={{
          width: "100%",
          padding: 1,
          display: "flex",
          justifyContent: "center",
          borderTop: "1px solid #f0f0f0",
        }}
      >
        <Button
          variant="contained"
          sx={{
            backgroundColor: "#0b1622",
            textTransform: "none",
            "&:hover": { backgroundColor: "#283848" },
          }}
          onClick={(e) => {
            e.stopPropagation(); // da ne trigeruje klik na kartu
            onAddToCart?.(product.productId);
          }}
        >
          Dodaj u korpu
        </Button>
      </Box>
    </Card>
  );
}
