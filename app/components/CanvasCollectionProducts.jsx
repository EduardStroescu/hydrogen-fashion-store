import {useState, useRef, useMemo, memo} from 'react';
import {useNavigate, useRouteLoaderData} from '@remix-run/react';
import {useFrame} from '@react-three/fiber';
import {EllipseCurve, Vector3} from 'three';
import {useCursor} from '@react-three/drei';

import {FloatingCircles} from './FloatingCircles';
import {useScrollContext} from '~/components';
import {AnimatedImage} from './AnimatedImage';
import {TitleCard} from './TitleCard';
import {easing} from 'maath';

const CollectionProducts = memo(function CollectionProducts({params}) {
  const collectionItemsData = useRouteLoaderData(
    'routes/($locale).collections.$collectionHandle',
  );

  const collectionsContent = useMemo(
    () => collectionItemsData?.collection?.products?.nodes,
    [collectionItemsData],
  );
  const productTexturesUrls = collectionsContent?.map(
    (collection) =>
      collection?.variants?.nodes?.[0]?.image?.url ||
      '/placeholders/placeholder.svg',
  );

  const groupRef = useRef();
  const scroll = useScrollContext();
  const numProducts = collectionsContent?.length;

  const points = useMemo(
    () =>
      new EllipseCurve(0, 0, 10, 10, 0, 2 * Math.PI, true, 0).getPoints(300),
    [],
  );

  let tOffset = 0.5; // Offset to stagger the products

  useFrame(() => {
    if (groupRef?.current) {
      groupRef.current.position.set(11, 1, 1);
      groupRef.current.rotation.set(Math.PI / 2, 0, 0);

      // Update positions of products along the path
      groupRef.current.children.forEach((product, index) => {
        const tProduct =
          (((-scroll.progress + tOffset + index / numProducts) % 1) + 1) % 1; // Clamp within [0, 1]
        const productPointIndex =
          Math.floor(tProduct * points.length) % points.length;
        const productPoint = points[productPointIndex];
        const lerpedPosition = new Vector3().lerpVectors(
          product.position,
          new Vector3(productPoint.x, productPoint.y, 0),
          0.055, // Adjust the interpolation factor for smoother or faster animation
        );

        product.position.set(lerpedPosition.x, lerpedPosition.y, 0);
        product.rotation.set(-Math.PI / 2, 0, 0); // Rotate the product to face the camera
      });
    }
  });

  return (
    <>
      <FloatingCircles points={points} />
      <group ref={groupRef}>
        {collectionsContent &&
          collectionsContent?.map((product, index) => {
            return (
              <Product
                key={product.id}
                index={index}
                texture={productTexturesUrls[index]}
                title={product.title}
                amount={product.variants.nodes[0].price.amount}
                currency={product.variants.nodes[0].price.currencyCode}
                handle={product.handle}
                locale={params.locale}
              />
            );
          })}
      </group>
    </>
  );
});

const Product = memo(function Product({
  texture,
  title,
  index,
  amount,
  currency,
  handle,
  locale,
}) {
  const groupRef = useRef(null);
  const [hovered, setHovered] = useState(false);

  const navigate = useNavigate();
  const handleProductsNavigate = (e, handle) => {
    e.stopPropagation();
    navigate(locale ? `${locale}/products/${handle}` : `/products/${handle}`);
  };

  useFrame((_, delta) => {
    if (groupRef?.current) {
      easing.damp3(groupRef.current.scale, hovered ? 1.1 : 1, 0.1, delta);
    }
  });
  useCursor(hovered);

  return (
    <group
      ref={groupRef}
      onPointerOver={(e) => (e.stopPropagation(), setHovered(true))}
      onPointerOut={(e) => (e.stopPropagation(), setHovered(false))}
      onClick={(e) => handleProductsNavigate(e, handle)}
    >
      <AnimatedImage
        url={texture}
        hovered={hovered}
        position={[0, 7.5, 0]}
        size={[9, 11, 20, 20]}
      />
      <TitleCard
        title={title}
        index={index}
        position={[0, 0.4, 0]}
        hovered={hovered}
      >
        {`${amount} ${currency}`}
      </TitleCard>
    </group>
  );
});

export default CollectionProducts;
