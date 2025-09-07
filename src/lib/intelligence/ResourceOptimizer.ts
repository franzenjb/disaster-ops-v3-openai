/**
 * INTELLIGENT RESOURCE OPTIMIZATION ENGINE
 * 
 * Provides proactive operational intelligence for Red Cross disaster operations
 * Automatically identifies optimal resource reallocation strategies without external APIs
 */

export interface ResourceGap {
  id: string;
  facilityId: string;
  facilityName: string;
  resourceType: string;
  quantityNeeded: number;
  quantityAvailable: number;
  gapAmount: number; // negative = shortage, positive = surplus
  priority: 'critical' | 'high' | 'medium' | 'low';
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  lastUpdated: string;
}

export interface ReallocationRecommendation {
  gapId: string;
  sourceFacility: {
    id: string;
    name: string;
    availableQuantity: number;
    location: { lat: number; lng: number; address: string };
  };
  targetFacility: {
    id: string;
    name: string;
    neededQuantity: number;
    location: { lat: number; lng: number; address: string };
  };
  recommendedQuantity: number;
  distance: number; // miles
  efficiency: number; // resources per mile
  transportTime: number; // estimated minutes
  cost: number; // estimated cost
  urgency: 'immediate' | 'soon' | 'routine';
  reasoning: string;
}

export interface OptimizationResult {
  totalGaps: number;
  resolvableGaps: number;
  recommendations: ReallocationRecommendation[];
  unresolvableGaps: ResourceGap[];
  costSavings: number;
  efficiency: number;
  summary: string;
}

export class ResourceOptimizer {
  private readonly EARTH_RADIUS_MILES = 3959;
  private readonly AVERAGE_SPEED_MPH = 35; // Including traffic and stops
  private readonly COST_PER_MILE = 2.50; // Vehicle operating cost
  private readonly SETUP_TIME_MINUTES = 15; // Time to load/unload

  /**
   * Calculate the haversine distance between two coordinates
   */
  private calculateDistance(
    lat1: number, lng1: number,
    lat2: number, lng2: number
  ): number {
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return this.EARTH_RADIUS_MILES * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Calculate transport time including setup
   */
  private calculateTransportTime(distance: number): number {
    const driveTime = (distance / this.AVERAGE_SPEED_MPH) * 60; // Convert to minutes
    return Math.ceil(driveTime + this.SETUP_TIME_MINUTES);
  }

  /**
   * Calculate transport cost
   */
  private calculateTransportCost(distance: number): number {
    return Math.round(distance * this.COST_PER_MILE * 100) / 100;
  }

  /**
   * Determine urgency based on gap priority and severity
   */
  private determineUrgency(gap: ResourceGap, distance: number): 'immediate' | 'soon' | 'routine' {
    if (gap.priority === 'critical') return 'immediate';
    if (gap.priority === 'high' && distance < 20) return 'soon';
    if (gap.priority === 'high' && distance >= 20) return 'immediate'; // High priority but far = immediate action needed
    return 'routine';
  }

  /**
   * Generate human-readable reasoning for the recommendation
   */
  private generateReasoning(
    gap: ResourceGap,
    source: ResourceGap,
    quantity: number,
    distance: number
  ): string {
    const reasons = [];

    // Distance-based reasoning
    if (distance < 5) reasons.push('very close proximity');
    else if (distance < 15) reasons.push('reasonable distance');
    else if (distance < 30) reasons.push('acceptable transport distance');
    else reasons.push('long distance but best available option');

    // Quantity-based reasoning
    const surplusRatio = source.gapAmount / quantity;
    if (surplusRatio > 5) reasons.push('large surplus available');
    else if (surplusRatio > 2) reasons.push('adequate surplus');
    else reasons.push('limited surplus but sufficient');

    // Priority-based reasoning
    if (gap.priority === 'critical') reasons.push('critical priority requirement');
    else if (gap.priority === 'high') reasons.push('high priority need');

    return `Best match: ${reasons.join(', ')}.`;
  }

  /**
   * Find optimal resource reallocations for all gaps
   */
  public optimizeResourceAllocation(gaps: ResourceGap[]): OptimizationResult {
    const shortages = gaps.filter(g => g.gapAmount < 0);
    const surpluses = gaps.filter(g => g.gapAmount > 0);
    const recommendations: ReallocationRecommendation[] = [];
    const unresolvableGaps: ResourceGap[] = [];

    let totalCostSavings = 0;
    let totalEfficiency = 0;

    // Process each shortage
    for (const shortage of shortages) {
      const availableSources = surpluses
        .filter(surplus => 
          surplus.resourceType === shortage.resourceType && 
          surplus.gapAmount > 0
        )
        .map(source => {
          const distance = this.calculateDistance(
            shortage.location.lat, shortage.location.lng,
            source.location.lat, source.location.lng
          );
          
          const maxTransferQuantity = Math.min(
            Math.abs(shortage.gapAmount),
            source.gapAmount
          );

          const efficiency = maxTransferQuantity / distance;
          
          return {
            source,
            distance,
            efficiency,
            maxTransferQuantity
          };
        })
        .sort((a, b) => {
          // Multi-criteria sorting: efficiency first, then distance
          if (Math.abs(a.efficiency - b.efficiency) < 0.1) {
            return a.distance - b.distance; // Prefer closer if efficiency similar
          }
          return b.efficiency - a.efficiency; // Prefer higher efficiency
        });

      if (availableSources.length > 0) {
        const bestSource = availableSources[0];
        const recommendedQuantity = bestSource.maxTransferQuantity;
        
        const transportTime = this.calculateTransportTime(bestSource.distance);
        const cost = this.calculateTransportCost(bestSource.distance);
        const urgency = this.determineUrgency(shortage, bestSource.distance);

        const recommendation: ReallocationRecommendation = {
          gapId: shortage.id,
          sourceFacility: {
            id: bestSource.source.facilityId,
            name: bestSource.source.facilityName,
            availableQuantity: bestSource.source.gapAmount,
            location: bestSource.source.location
          },
          targetFacility: {
            id: shortage.facilityId,
            name: shortage.facilityName,
            neededQuantity: Math.abs(shortage.gapAmount),
            location: shortage.location
          },
          recommendedQuantity,
          distance: Math.round(bestSource.distance * 10) / 10,
          efficiency: Math.round(bestSource.efficiency * 100) / 100,
          transportTime,
          cost,
          urgency,
          reasoning: this.generateReasoning(shortage, bestSource.source, recommendedQuantity, bestSource.distance)
        };

        recommendations.push(recommendation);
        
        // Update available quantities (simulate the transfer)
        bestSource.source.gapAmount -= recommendedQuantity;
        shortage.gapAmount += recommendedQuantity;

        // Calculate cost savings (assume emergency procurement would be 50% more expensive)
        const emergencyProcurementCost = recommendedQuantity * 25; // $25 per unit emergency procurement
        const transferSavings = emergencyProcurementCost - cost;
        totalCostSavings += transferSavings;
        totalEfficiency += bestSource.efficiency;

      } else {
        unresolvableGaps.push(shortage);
      }
    }

    // Calculate overall metrics
    const resolvableGaps = shortages.length - unresolvableGaps.length;
    const overallEfficiency = recommendations.length > 0 
      ? Math.round((totalEfficiency / recommendations.length) * 100) / 100
      : 0;

    // Generate summary
    let summary = `Analyzed ${gaps.length} resource positions. `;
    summary += `Found ${recommendations.length} optimal reallocation solutions `;
    summary += `resolving ${resolvableGaps}/${shortages.length} shortages. `;
    
    if (totalCostSavings > 0) {
      summary += `Estimated cost savings: $${Math.round(totalCostSavings)}.`;
    }

    return {
      totalGaps: shortages.length,
      resolvableGaps,
      recommendations: recommendations.sort((a, b) => {
        // Sort by urgency, then by efficiency
        const urgencyOrder = { immediate: 0, soon: 1, routine: 2 };
        if (urgencyOrder[a.urgency] !== urgencyOrder[b.urgency]) {
          return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
        }
        return b.efficiency - a.efficiency;
      }),
      unresolvableGaps,
      costSavings: Math.round(totalCostSavings),
      efficiency: overallEfficiency,
      summary
    };
  }

  /**
   * Get quick insights for dashboard display
   */
  public getResourceInsights(gaps: ResourceGap[]): {
    criticalShortages: number;
    totalSurplus: number;
    averageDistance: number;
    quickWins: ReallocationRecommendation[];
  } {
    const optimization = this.optimizeResourceAllocation(gaps);
    const criticalShortages = gaps.filter(g => g.gapAmount < 0 && g.priority === 'critical').length;
    const totalSurplus = gaps.filter(g => g.gapAmount > 0).reduce((sum, g) => sum + g.gapAmount, 0);
    
    const averageDistance = optimization.recommendations.length > 0
      ? Math.round(optimization.recommendations.reduce((sum, r) => sum + r.distance, 0) / optimization.recommendations.length * 10) / 10
      : 0;

    const quickWins = optimization.recommendations.filter(r => 
      r.distance < 15 && r.efficiency > 5 && r.urgency !== 'routine'
    ).slice(0, 3);

    return {
      criticalShortages,
      totalSurplus,
      averageDistance,
      quickWins
    };
  }

  /**
   * Predict resource needs based on historical patterns and current trends
   */
  public predictResourceNeeds(
    currentGaps: ResourceGap[],
    historicalData?: { type: string; trend: number; seasonality: number }[]
  ): { type: string; predictedShortage: number; confidence: number; timeframe: string }[] {
    const predictions = [];

    // Group current gaps by resource type
    const typeGroups = currentGaps.reduce((groups, gap) => {
      if (!groups[gap.resourceType]) {
        groups[gap.resourceType] = { shortages: 0, surpluses: 0 };
      }
      if (gap.gapAmount < 0) groups[gap.resourceType].shortages += Math.abs(gap.gapAmount);
      else groups[gap.resourceType].surpluses += gap.gapAmount;
      return groups;
    }, {} as Record<string, { shortages: number; surpluses: number }>);

    for (const [resourceType, data] of Object.entries(typeGroups)) {
      if (data.shortages > 0) {
        // Simple trend analysis - could be enhanced with more sophisticated algorithms
        const currentRatio = data.shortages / (data.shortages + data.surpluses);
        let predictedShortage = data.shortages * 1.2; // 20% increase prediction
        let confidence = 0.7; // Base confidence
        let timeframe = '24 hours';

        // Adjust based on resource type
        switch (resourceType.toLowerCase()) {
          case 'water':
          case 'food':
            predictedShortage *= 1.5; // Essential resources deplete faster
            confidence = 0.85;
            timeframe = '12 hours';
            break;
          case 'blankets':
          case 'cots':
            predictedShortage *= 1.1; // Slower depletion
            confidence = 0.75;
            timeframe = '48 hours';
            break;
          case 'medical supplies':
            predictedShortage *= 1.3; // Moderate depletion
            confidence = 0.8;
            timeframe = '18 hours';
            break;
        }

        predictions.push({
          type: resourceType,
          predictedShortage: Math.round(predictedShortage),
          confidence: Math.round(confidence * 100) / 100,
          timeframe
        });
      }
    }

    return predictions.sort((a, b) => b.confidence - a.confidence);
  }
}

/**
 * Factory function for creating optimizer instance
 */
export function createResourceOptimizer(): ResourceOptimizer {
  return new ResourceOptimizer();
}

/**
 * Utility function to convert facility data to ResourceGap format
 */
export function facilitiesToResourceGaps(facilities: any[]): ResourceGap[] {
  const gaps: ResourceGap[] = [];
  
  facilities.forEach(facility => {
    // Convert assets to resource gaps
    facility.assets?.forEach((asset: any) => {
      if (asset.required !== asset.have) {
        gaps.push({
          id: `${facility.id}-${asset.type}`,
          facilityId: facility.id,
          facilityName: facility.name,
          resourceType: asset.type,
          quantityNeeded: asset.required,
          quantityAvailable: asset.have,
          gapAmount: asset.have - asset.required,
          priority: asset.gap > 50 ? 'critical' : asset.gap > 20 ? 'high' : asset.gap > 0 ? 'medium' : 'low',
          location: {
            lat: facility.coordinates?.lat || 28.0586,
            lng: facility.coordinates?.lng || -82.4139,
            address: facility.address
          },
          lastUpdated: new Date().toISOString()
        });
      }
    });

    // Convert personnel to resource gaps
    facility.positions?.forEach((position: any) => {
      if (position.required !== position.have) {
        gaps.push({
          id: `${facility.id}-${position.code}`,
          facilityId: facility.id,
          facilityName: facility.name,
          resourceType: position.title,
          quantityNeeded: position.required,
          quantityAvailable: position.have,
          gapAmount: position.have - position.required,
          priority: position.gap > 2 ? 'critical' : position.gap > 0 ? 'high' : 'medium',
          location: {
            lat: facility.coordinates?.lat || 28.0586,
            lng: facility.coordinates?.lng || -82.4139,
            address: facility.address
          },
          lastUpdated: new Date().toISOString()
        });
      }
    });
  });

  return gaps;
}