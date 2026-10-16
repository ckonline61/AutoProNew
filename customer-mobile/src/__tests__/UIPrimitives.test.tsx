import React from 'react';
import renderer, { act } from 'react-test-renderer';
import {
  AutoProLogo,
  Button,
  Badge,
  Card,
  Tag,
  PriceText,
  RatingStars,
  SearchBar,
  TabPills,
  SectionHeader,
  Divider,
  Avatar,
} from '../components/ui';

describe('Auto Pro UI Primitive Components', () => {
  it('renders AutoProLogo with various sizes and taglines', () => {
    let tree: renderer.ReactTestRendererJSON | null = null;
    act(() => {
      const component = renderer.create(
        <AutoProLogo size="sm" tagline="Car Service & Repair" />
      );
      tree = component.toJSON() as renderer.ReactTestRendererJSON;
    });
    expect(tree).toBeDefined();

    act(() => {
      const component = renderer.create(<AutoProLogo size="lg" layout="vertical" />);
      tree = component.toJSON() as renderer.ReactTestRendererJSON;
    });
    expect(tree).toBeDefined();
  });

  it('renders Button with variants, sizes, and states', () => {
    let tree: renderer.ReactTestRendererJSON | null = null;
    act(() => {
      const component = renderer.create(
        <Button title="Book Service" variant="primary" size="lg" icon="car-sport" fullWidth />
      );
      tree = component.toJSON() as renderer.ReactTestRendererJSON;
    });
    expect(tree).toBeDefined();

    act(() => {
      const component = renderer.create(
        <Button title="Loading" loading variant="secondary" size="md" />
      );
      tree = component.toJSON() as renderer.ReactTestRendererJSON;
    });
    expect(tree).toBeDefined();

    act(() => {
      const component = renderer.create(
        <Button title="Outline" variant="outline" size="sm" disabled />
      );
      tree = component.toJSON() as renderer.ReactTestRendererJSON;
    });
    expect(tree).toBeDefined();
  });

  it('renders Badge with all variants and sizes', () => {
    const variants = ['success', 'warning', 'error', 'info', 'default'] as const;
    variants.forEach((variant) => {
      let tree: renderer.ReactTestRendererJSON | null = null;
      act(() => {
        const component = renderer.create(
          <Badge text={variant.toUpperCase()} variant={variant} size="md" />
        );
        tree = component.toJSON() as renderer.ReactTestRendererJSON;
      });
      expect(tree).toBeDefined();
    });
  });

  it('renders Card with and without onPress', () => {
    let tree: renderer.ReactTestRendererJSON | null = null;
    act(() => {
      const component = renderer.create(
        <Card padding="md">
          <></>
        </Card>
      );
      tree = component.toJSON() as renderer.ReactTestRendererJSON;
    });
    expect(tree).toBeDefined();

    act(() => {
      const component = renderer.create(
        <Card onPress={() => {}} elevation="lg">
          <></>
        </Card>
      );
      tree = component.toJSON() as renderer.ReactTestRendererJSON;
    });
    expect(tree).toBeDefined();
  });

  it('renders Tag with label, color, and icon', () => {
    let tree: renderer.ReactTestRendererJSON | null = null;
    act(() => {
      const component = renderer.create(
        <Tag label="Petrol" icon="water" color="#DC2626" />
      );
      tree = component.toJSON() as renderer.ReactTestRendererJSON;
    });
    expect(tree).toBeDefined();
  });

  it('renders PriceText with discount calculations', () => {
    let tree: renderer.ReactTestRendererJSON | null = null;
    act(() => {
      const component = renderer.create(
        <PriceText price={1499} originalPrice={1999} size="lg" />
      );
      tree = component.toJSON() as renderer.ReactTestRendererJSON;
    });
    expect(tree).toBeDefined();
  });

  it('renders RatingStars with numeric and count', () => {
    let tree: renderer.ReactTestRendererJSON | null = null;
    act(() => {
      const component = renderer.create(
        <RatingStars rating={4.8} reviewCount={142} size="md" />
      );
      tree = component.toJSON() as renderer.ReactTestRendererJSON;
    });
    expect(tree).toBeDefined();
  });

  it('renders SearchBar with filter icon and clearable input', () => {
    let tree: renderer.ReactTestRendererJSON | null = null;
    act(() => {
      const component = renderer.create(
        <SearchBar
          value="Engine oil"
          onChangeText={() => {}}
          onFilterPress={() => {}}
        />
      );
      tree = component.toJSON() as renderer.ReactTestRendererJSON;
    });
    expect(tree).toBeDefined();
  });

  it('renders TabPills with counts and active selection', () => {
    let tree: renderer.ReactTestRendererJSON | null = null;
    const tabs = [
      { key: 'all', label: 'All', count: 12 },
      { key: 'active', label: 'In Progress', count: 3 },
      { key: 'completed', label: 'Completed' },
    ];
    act(() => {
      const component = renderer.create(
        <TabPills tabs={tabs} activeTab="active" onTabChange={() => {}} />
      );
      tree = component.toJSON() as renderer.ReactTestRendererJSON;
    });
    expect(tree).toBeDefined();
  });

  it('renders SectionHeader with title and actionText', () => {
    let tree: renderer.ReactTestRendererJSON | null = null;
    act(() => {
      const component = renderer.create(
        <SectionHeader
          title="Popular Services"
          actionText="View All"
          onAction={() => {}}
        />
      );
      tree = component.toJSON() as renderer.ReactTestRendererJSON;
    });
    expect(tree).toBeDefined();
  });

  it('renders Divider with horizontal and vertical styles', () => {
    let tree: renderer.ReactTestRendererJSON | null = null;
    act(() => {
      const component = renderer.create(<Divider spacing="lg" />);
      tree = component.toJSON() as renderer.ReactTestRendererJSON;
    });
    expect(tree).toBeDefined();

    act(() => {
      const component = renderer.create(<Divider orientation="vertical" spacing="sm" />);
      tree = component.toJSON() as renderer.ReactTestRendererJSON;
    });
    expect(tree).toBeDefined();
  });

  it('renders Avatar with image, initials, and status dot', () => {
    let tree: renderer.ReactTestRendererJSON | null = null;
    act(() => {
      const component = renderer.create(
        <Avatar name="Rahul Sharma" size="lg" status="online" />
      );
      tree = component.toJSON() as renderer.ReactTestRendererJSON;
    });
    expect(tree).toBeDefined();

    act(() => {
      const component = renderer.create(
        <Avatar uri="https://example.com/avatar.jpg" size="md" status="busy" />
      );
      tree = component.toJSON() as renderer.ReactTestRendererJSON;
    });
    expect(tree).toBeDefined();
  });
});
