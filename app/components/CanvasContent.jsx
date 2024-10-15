import {lazy} from 'react';
import {useParams} from '@remix-run/react';
import {extend} from '@react-three/fiber';

import {useIsHomePath} from '~/lib/utils';
import {RoundedRectGeometry} from '~/lib/RoundedRectGeometry';
import {BentPlaneGeometry} from '~/lib/BentPlaneGeometry';
import {Camera, CanvasRoom, CanvasEnvironment, Collections} from '~/components';

const CollectionProducts = lazy(() => import('./CanvasCollectionProducts'));

extend({
  BentPlaneGeometry,
  RoundedRectGeometry,
});

export function CanvasContent() {
  const isHome = useIsHomePath();
  const params = useParams();

  return (
    <>
      {isHome && <Collections params={params} />}
      {params.collectionHandle && <CollectionProducts params={params} />}
      <CanvasRoom />
      <Camera position={[5, 0, 26]} />
      <CanvasEnvironment />
    </>
  );
}
